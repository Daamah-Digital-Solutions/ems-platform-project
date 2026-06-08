from datetime import datetime, timedelta, date as _date

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, and_, or_, func

from .. import models, schemas
from ..deps import DB, CurrentUser, StudioId


router = APIRouter(prefix="/api/bookings", tags=["bookings"])


PRAYER_WINDOWS_DEFAULT = [
    ("05:20", "الفجر"),
    ("12:05", "الظهر"),
    ("15:20", "العصر"),
    ("18:05", "المغرب"),
    ("19:30", "العشاء"),
]


def _hits_prayer_window(start: datetime, duration: int, buffer_min: int) -> str | None:
    end = start + timedelta(minutes=duration)
    for tstr, name in PRAYER_WINDOWS_DEFAULT:
        h, m = tstr.split(":")
        pt = start.replace(hour=int(h), minute=int(m), second=0, microsecond=0)
        window_start = pt - timedelta(minutes=buffer_min)
        window_end = pt + timedelta(minutes=buffer_min)
        if start < window_end and end > window_start:
            return name
    return None


def _serialize(b: models.Booking, db) -> dict:
    c = db.get(models.Client, b.client_id)
    t = db.get(models.Trainer, b.trainer_id)
    m = db.get(models.Machine, b.machine_id)
    return {
        "id": b.id,
        "studio_id": b.studio_id,
        "client_id": b.client_id,
        "trainer_id": b.trainer_id,
        "machine_id": b.machine_id,
        "suit_id": b.suit_id,
        "start_time": b.start_time,
        "duration_min": b.duration_min,
        "status": b.status,
        "note": b.note,
        "client_name": c.name_ar if c else None,
        "trainer_name": t.name_ar if t else None,
        "machine_label": m.label if m else None,
    }


@router.get("")
def list_bookings(
    db: DB,
    studio_id: StudioId,
    date: _date | None = Query(None, description="YYYY-MM-DD"),
    start: datetime | None = None,
    end: datetime | None = None,
    trainer_id: int | None = None,
    machine_id: int | None = None,
):
    stmt = select(models.Booking).where(models.Booking.studio_id == studio_id)
    if date:
        day_start = datetime.combine(date, datetime.min.time())
        day_end = day_start + timedelta(days=1)
        stmt = stmt.where(models.Booking.start_time >= day_start, models.Booking.start_time < day_end)
    elif start and end:
        stmt = stmt.where(models.Booking.start_time >= start, models.Booking.start_time < end)
    if trainer_id:
        stmt = stmt.where(models.Booking.trainer_id == trainer_id)
    if machine_id:
        stmt = stmt.where(models.Booking.machine_id == machine_id)
    rows = db.scalars(stmt.order_by(models.Booking.start_time.asc())).all()
    return [_serialize(b, db) for b in rows]


@router.get("/availability")
def availability(
    db: DB,
    studio_id: StudioId,
    date: _date = Query(..., description="YYYY-MM-DD"),
):
    """Return prayer windows + booked slots for given day."""
    day_start = datetime.combine(date, datetime.min.time())
    day_end = day_start + timedelta(days=1)
    studio = db.get(models.Studio, studio_id)
    booked = db.scalars(
        select(models.Booking).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= day_start,
            models.Booking.start_time < day_end,
        )
    ).all()
    busy = [{"start": b.start_time, "duration": b.duration_min, "machine_id": b.machine_id} for b in booked]
    prayers = []
    for tstr, name in PRAYER_WINDOWS_DEFAULT:
        h, m = tstr.split(":")
        pt = day_start.replace(hour=int(h), minute=int(m))
        prayers.append({"name": name, "time": pt, "buffer_min": studio.prayer_buffer_min if studio else 10})
    return {"prayers": prayers, "busy": busy, "block_prayer": studio.block_prayer if studio else True}


@router.post("", status_code=201)
def create_booking(payload: schemas.BookingCreate, db: DB, user: CurrentUser):
    studio_id = user.studio_id
    studio = db.get(models.Studio, studio_id)

    # Normalize datetime to naive (DB stores naive UTC)
    start_time = payload.start_time
    if start_time.tzinfo is not None:
        start_time = start_time.replace(tzinfo=None)
    payload_start = start_time

    # Validate client belongs to studio
    client = db.get(models.Client, payload.client_id)
    if not client or client.studio_id != studio_id:
        raise HTTPException(400, "العميل غير موجود")

    # Validate trainer/machine/suit
    trainer = db.get(models.Trainer, payload.trainer_id)
    if not trainer or trainer.studio_id != studio_id:
        raise HTTPException(400, "المدرب غير موجود")
    machine = db.get(models.Machine, payload.machine_id)
    if not machine or machine.studio_id != studio_id:
        raise HTTPException(400, "الجهاز غير موجود")
    if machine.status == "صيانة مجدولة":
        raise HTTPException(400, "الجهاز في صيانة مجدولة")
    if payload.suit_id:
        suit = db.get(models.Suit, payload.suit_id)
        if not suit or suit.studio_id != studio_id:
            raise HTTPException(400, "البدلة غير موجودة")

    # PAR-Q check
    if client.parq_flags and len(client.parq_flags) > 0 and not payload.parq_ack:
        raise HTTPException(
            400,
            f"العميل لديه تنبيهات PAR-Q ({', '.join(client.parq_flags)}). يجب تأكيد المدرب."
        )

    # Prayer time check
    if studio and studio.block_prayer:
        hit = _hits_prayer_window(payload_start, payload.duration_min, studio.prayer_buffer_min)
        if hit:
            raise HTTPException(400, f"الموعد يتداخل مع وقت صلاة {hit}.")

    # Conflict check on same machine (any overlap)
    end_time = payload_start + timedelta(minutes=payload.duration_min)
    # Overlap: bookings.start < end_time AND bookings.start + duration > start_time
    # Since we have a fixed duration_min stored, query in two passes
    candidates = db.scalars(
        select(models.Booking).where(
            models.Booking.studio_id == studio_id,
            models.Booking.machine_id == payload.machine_id,
            models.Booking.status.in_(["مؤكد", "جاري"]),
            models.Booking.start_time < end_time,
        )
    ).all()
    for c in candidates:
        c_end = c.start_time + timedelta(minutes=c.duration_min)
        if c_end > payload_start:
            raise HTTPException(400, "الجهاز محجوز في هذا الوقت")

    # Conflict on trainer
    t_candidates = db.scalars(
        select(models.Booking).where(
            models.Booking.studio_id == studio_id,
            models.Booking.trainer_id == payload.trainer_id,
            models.Booking.status.in_(["مؤكد", "جاري"]),
            models.Booking.start_time < end_time,
        )
    ).all()
    for c in t_candidates:
        c_end = c.start_time + timedelta(minutes=c.duration_min)
        if c_end > payload_start:
            raise HTTPException(400, "المدرب مشغول في هذا الوقت")

    # Find active subscription with sessions left
    sub = db.scalar(
        select(models.Subscription)
        .where(
            models.Subscription.client_id == client.id,
            models.Subscription.status == "نشطة",
        )
        .order_by(models.Subscription.id.desc())
    )
    if sub:
        pkg = db.get(models.Package, sub.package_id)
        if pkg and not pkg.unlimited and sub.sessions_remaining <= 0:
            raise HTTPException(400, "الباقة لا تحتوي جلسات متبقية")

    b = models.Booking(
        studio_id=studio_id,
        client_id=client.id,
        trainer_id=trainer.id,
        machine_id=machine.id,
        suit_id=payload.suit_id,
        subscription_id=sub.id if sub else None,
        start_time=payload_start,
        duration_min=payload.duration_min,
        status="مؤكد",
        note=payload.note,
        parq_ack_by=user.id if payload.parq_ack else None,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return _serialize(b, db)


@router.patch("/{booking_id}")
def update_booking(booking_id: int, payload: schemas.BookingUpdate, db: DB, studio_id: StudioId):
    b = db.get(models.Booking, booking_id)
    if not b or b.studio_id != studio_id:
        raise HTTPException(404)
    prev_status = b.status
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(b, k, v)
    # Decrement sub on completion
    if b.status == "مكتمل" and prev_status != "مكتمل" and b.subscription_id:
        sub = db.get(models.Subscription, b.subscription_id)
        if sub:
            pkg = db.get(models.Package, sub.package_id)
            if pkg and not pkg.unlimited and sub.sessions_remaining > 0:
                sub.sessions_remaining -= 1
    db.commit()
    db.refresh(b)
    return _serialize(b, db)


@router.delete("/{booking_id}", status_code=204)
def cancel_booking(booking_id: int, db: DB, studio_id: StudioId):
    b = db.get(models.Booking, booking_id)
    if not b or b.studio_id != studio_id:
        raise HTTPException(404)
    b.status = "ملغي"
    db.commit()
