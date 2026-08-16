"""Manual payments / invoices ledger.

Staff log every payment (subscription, trial session, …) for a client with the
amount and an optional invoice attached as an image or file. Powers per-client
totals and the automatic end-of-month summary.
"""
import os
import uuid
from datetime import date, datetime

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy import select, func

from .. import models, schemas
from ..config import settings
from ..deps import DB, CurrentUser, StudioId


router = APIRouter(prefix="/api/manual-payments", tags=["manual-payments"])

ALLOWED_TYPES = ("image/", "application/pdf")
KINDS = {"اشتراك", "جلسة تجريبية", "أخرى"}


def _upload_dir(studio_id: int) -> str:
    d = os.path.join(settings.upload_dir, "manual", str(studio_id))
    os.makedirs(d, exist_ok=True)
    return d


def _serialize(p: models.ManualPayment) -> dict:
    return {
        "id": p.id,
        "client_id": p.client_id,
        "client_name": p.client_name,
        "amount": p.amount,
        "currency": p.currency,
        "kind": p.kind,
        "method": p.method,
        "note": p.note,
        "paid_at": p.paid_at,
        "has_attachment": bool(p.attachment_path),
        "attachment_name": p.attachment_name,
        "attachment_type": p.attachment_type,
        "created_at": p.created_at,
    }


def _month_bounds(month: str | None):
    """Return (start_date, end_date, 'YYYY-MM') for a month filter (default: current)."""
    today = date.today()
    if month:
        try:
            y, m = (int(x) for x in month.split("-")[:2])
        except Exception:
            raise HTTPException(400, "صيغة الشهر غير صحيحة (YYYY-MM)")
    else:
        y, m = today.year, today.month
    start = date(y, m, 1)
    end = date(y + 1, 1, 1) if m == 12 else date(y, m + 1, 1)
    return start, end, f"{y:04d}-{m:02d}"


@router.post("", response_model=schemas.ManualPaymentOut, status_code=201)
async def create_manual_payment(
    db: DB,
    user: CurrentUser,
    amount: float = Form(...),
    kind: str = Form("اشتراك"),
    client_id: int | None = Form(None),
    client_name: str | None = Form(None),
    method: str | None = Form(None),
    note: str | None = Form(None),
    paid_at: str | None = Form(None),
    file: UploadFile | None = File(None),
):
    if amount is None or amount < 0:
        raise HTTPException(400, "المبلغ غير صحيح")
    if kind not in KINDS:
        kind = "أخرى"

    # Resolve the client name (from a saved client, or free text for walk-ins)
    name = (client_name or "").strip()
    cid = None
    if client_id:
        client = db.get(models.Client, client_id)
        if not client or client.studio_id != user.studio_id:
            raise HTTPException(400, "العميل غير موجود")
        cid = client.id
        name = client.name_ar
    if not name:
        raise HTTPException(400, "اسم العميل مطلوب")

    # Payment date
    try:
        pdate = date.fromisoformat(paid_at) if paid_at else date.today()
    except ValueError:
        pdate = date.today()

    # Optional invoice attachment
    att_path = att_name = att_type = None
    if file is not None and file.filename:
        ctype = (file.content_type or "").lower()
        if not ctype.startswith(ALLOWED_TYPES):
            raise HTTPException(400, "نوع الملف غير مدعوم — الصور أو PDF فقط")
        data = await file.read()
        if len(data) > settings.max_upload_mb * 1024 * 1024:
            raise HTTPException(400, f"حجم الملف أكبر من {settings.max_upload_mb} ميجابايت")
        ext = os.path.splitext(file.filename)[1][:12] or ""
        fname = f"{uuid.uuid4().hex}{ext}"
        dest = os.path.join(_upload_dir(user.studio_id), fname)
        with open(dest, "wb") as fh:
            fh.write(data)
        att_path, att_name, att_type = dest, file.filename[:200], ctype[:80]

    p = models.ManualPayment(
        studio_id=user.studio_id, client_id=cid, client_name=name[:160],
        amount=float(amount), currency="SAR", kind=kind,
        method=(method or None), note=(note or None),
        attachment_path=att_path, attachment_name=att_name, attachment_type=att_type,
        paid_at=pdate, created_by=user.id,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return _serialize(p)


@router.get("", response_model=list[schemas.ManualPaymentOut])
def list_manual_payments(
    db: DB,
    studio_id: StudioId,
    month: str | None = Query(None, description="YYYY-MM"),
    client_id: int | None = None,
    limit: int = 500,
):
    stmt = select(models.ManualPayment).where(models.ManualPayment.studio_id == studio_id)
    if month:
        start, end, _ = _month_bounds(month)
        stmt = stmt.where(models.ManualPayment.paid_at >= start, models.ManualPayment.paid_at < end)
    if client_id:
        stmt = stmt.where(models.ManualPayment.client_id == client_id)
    stmt = stmt.order_by(models.ManualPayment.paid_at.desc(), models.ManualPayment.id.desc()).limit(limit)
    return [_serialize(p) for p in db.scalars(stmt).all()]


@router.get("/summary", response_model=schemas.ManualPaymentSummary)
def manual_payment_summary(db: DB, studio_id: StudioId, month: str | None = Query(None)):
    start, end, label = _month_bounds(month)
    rows = db.execute(
        select(models.ManualPayment.kind, func.sum(models.ManualPayment.amount), func.count())
        .where(
            models.ManualPayment.studio_id == studio_id,
            models.ManualPayment.paid_at >= start,
            models.ManualPayment.paid_at < end,
        )
        .group_by(models.ManualPayment.kind)
    ).all()
    by_kind = {k: float(total or 0) for k, total, _ in rows}
    total = sum(by_kind.values())
    count = sum(c for _, _, c in rows)
    return {"month": label, "total": total, "count": count, "by_kind": by_kind}


@router.get("/{payment_id}/attachment")
def get_attachment(payment_id: int, db: DB, studio_id: StudioId):
    p = db.get(models.ManualPayment, payment_id)
    if not p or p.studio_id != studio_id:
        raise HTTPException(404)
    if not p.attachment_path or not os.path.exists(p.attachment_path):
        raise HTTPException(404, "لا يوجد مرفق")
    return FileResponse(p.attachment_path, media_type=p.attachment_type or "application/octet-stream", filename=p.attachment_name or "invoice")


@router.delete("/{payment_id}", status_code=204)
def delete_manual_payment(payment_id: int, db: DB, studio_id: StudioId):
    p = db.get(models.ManualPayment, payment_id)
    if not p or p.studio_id != studio_id:
        raise HTTPException(404)
    if p.attachment_path and os.path.exists(p.attachment_path):
        try:
            os.remove(p.attachment_path)
        except OSError:
            pass
    db.delete(p)
    db.commit()
