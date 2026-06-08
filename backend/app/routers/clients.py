from datetime import datetime, date

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, func, and_, or_

from .. import models, schemas
from ..deps import DB, CurrentUser, StudioId


router = APIRouter(prefix="/api/clients", tags=["clients"])


def _serialize_client(c: models.Client, db) -> dict:
    """Hydrate client with computed fields (active package, next booking, trainer name)."""
    # active subscription
    sub = db.scalar(
        select(models.Subscription)
        .where(models.Subscription.client_id == c.id, models.Subscription.status == "نشطة")
        .order_by(models.Subscription.id.desc())
    )
    package_name = None
    remaining = 0
    total = 0
    if sub:
        pkg = db.get(models.Package, sub.package_id)
        package_name = pkg.name_ar if pkg else None
        total = sub.sessions_total
        remaining = "∞" if (pkg and pkg.unlimited) else sub.sessions_remaining

    # next booking
    next_bk = db.scalar(
        select(models.Booking)
        .where(
            models.Booking.client_id == c.id,
            models.Booking.start_time >= datetime.utcnow(),
            models.Booking.status.in_(["مؤكد", "جاري"]),
        )
        .order_by(models.Booking.start_time.asc())
    )
    next_str = "لا يوجد"
    if next_bk:
        next_str = next_bk.start_time.strftime("%Y-%m-%d %H:%M")

    # preferred trainer
    trainer_name = None
    if c.preferred_trainer_id:
        tr = db.get(models.Trainer, c.preferred_trainer_id)
        trainer_name = tr.name_ar if tr else None

    return {
        **{k: getattr(c, k) for k in [
            "id", "studio_id", "name_ar", "name_en", "phone", "email", "gender", "age",
            "status", "tags", "suit_size", "preferred_trainer_id", "parq_status",
            "parq_expiry", "parq_flags", "last_session", "join_date",
        ]},
        "active_package": package_name,
        "remaining": remaining,
        "total": total,
        "next_booking": next_str,
        "preferred_trainer_name": trainer_name,
    }


@router.get("")
def list_clients(
    db: DB,
    studio_id: StudioId,
    q: str | None = Query(None),
    status: str | None = Query(None),
    gender: str | None = Query(None),
    tag: str | None = Query(None),
    limit: int = 100,
):
    stmt = select(models.Client).where(models.Client.studio_id == studio_id)
    if q:
        stmt = stmt.where(or_(models.Client.name_ar.contains(q), models.Client.phone.contains(q)))
    if status and status != "all":
        stmt = stmt.where(models.Client.status == status)
    if gender and gender != "all":
        stmt = stmt.where(models.Client.gender == gender)
    stmt = stmt.order_by(models.Client.id.desc()).limit(limit)
    rows = db.scalars(stmt).all()
    if tag and tag != "all":
        rows = [r for r in rows if r.tags and tag in r.tags]
    return [_serialize_client(c, db) for c in rows]


@router.get("/{client_id}")
def get_client(client_id: int, db: DB, studio_id: StudioId):
    c = db.get(models.Client, client_id)
    if not c or c.studio_id != studio_id:
        raise HTTPException(404, "العميل غير موجود")
    return _serialize_client(c, db)


@router.post("", status_code=201)
def create_client(payload: schemas.ClientCreate, db: DB, studio_id: StudioId):
    data = payload.model_dump()
    c = models.Client(studio_id=studio_id, join_date=date.today().strftime("%Y/%m/%d"), **data)
    db.add(c)
    db.commit()
    db.refresh(c)
    return _serialize_client(c, db)


@router.patch("/{client_id}")
def update_client(client_id: int, payload: schemas.ClientUpdate, db: DB, studio_id: StudioId):
    c = db.get(models.Client, client_id)
    if not c or c.studio_id != studio_id:
        raise HTTPException(404, "العميل غير موجود")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return _serialize_client(c, db)


@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: int, db: DB, studio_id: StudioId):
    c = db.get(models.Client, client_id)
    if not c or c.studio_id != studio_id:
        raise HTTPException(404, "العميل غير موجود")
    db.delete(c)
    db.commit()


# ---- notes ----
@router.get("/{client_id}/notes", response_model=list[schemas.NoteOut])
def list_notes(client_id: int, db: DB, studio_id: StudioId):
    c = db.get(models.Client, client_id)
    if not c or c.studio_id != studio_id:
        raise HTTPException(404)
    notes = db.scalars(
        select(models.Note)
        .where(models.Note.client_id == client_id)
        .order_by(models.Note.created_at.desc())
    ).all()
    out = []
    for n in notes:
        author = db.get(models.User, n.author_id)
        out.append({
            "id": n.id,
            "body": n.body,
            "created_at": n.created_at,
            "author_name": author.name_ar if author else None,
        })
    return out


@router.post("/{client_id}/notes", response_model=schemas.NoteOut, status_code=201)
def add_note(client_id: int, payload: schemas.NoteCreate, db: DB, user: CurrentUser):
    c = db.get(models.Client, client_id)
    if not c or c.studio_id != user.studio_id:
        raise HTTPException(404)
    note = models.Note(studio_id=user.studio_id, client_id=client_id, author_id=user.id, body=payload.body)
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "body": note.body, "created_at": note.created_at, "author_name": user.name_ar}


# ---- subscriptions for a client ----
@router.get("/{client_id}/subscriptions", response_model=list[schemas.SubscriptionOut])
def list_subs(client_id: int, db: DB, studio_id: StudioId):
    c = db.get(models.Client, client_id)
    if not c or c.studio_id != studio_id:
        raise HTTPException(404)
    return db.scalars(
        select(models.Subscription)
        .where(models.Subscription.client_id == client_id)
        .order_by(models.Subscription.id.desc())
    ).all()


# ---- recent bookings for a client ----
@router.get("/{client_id}/bookings")
def list_client_bookings(client_id: int, db: DB, studio_id: StudioId, limit: int = 20):
    c = db.get(models.Client, client_id)
    if not c or c.studio_id != studio_id:
        raise HTTPException(404)
    bks = db.scalars(
        select(models.Booking)
        .where(models.Booking.client_id == client_id)
        .order_by(models.Booking.start_time.desc())
        .limit(limit)
    ).all()
    out = []
    for b in bks:
        tr = db.get(models.Trainer, b.trainer_id)
        mc = db.get(models.Machine, b.machine_id)
        out.append({
            "id": b.id,
            "start_time": b.start_time,
            "status": b.status,
            "trainer_name": tr.name_ar if tr else None,
            "machine_label": mc.label if mc else None,
        })
    return out
