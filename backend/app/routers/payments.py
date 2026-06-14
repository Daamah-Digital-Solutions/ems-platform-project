"""Payment links via Tap.

Staff create a payment for a client + package → we open a Tap charge and store the
hosted payment URL to send to the client. Tap calls our webhook and redirects the
browser to our callback; in both cases we re-fetch the charge from Tap to confirm
status. On a captured payment we activate the client's subscription.
"""
from datetime import datetime

from fastapi import APIRouter, HTTPException, Body, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from .. import models, schemas
from ..deps import DB, CurrentUser, StudioId
from ..config import settings
from ..services import tap
from .packages import create_subscription_for


router = APIRouter(prefix="/api/payments", tags=["payments"])

# Tap charge statuses that mean the money was collected / definitively not collected
PAID_STATUS = "CAPTURED"
FAILED_STATUSES = {"FAILED", "DECLINED", "ABANDONED", "CANCELLED", "VOID", "TIMEDOUT", "EXPIRED"}


def _serialize(p: models.Payment, db) -> dict:
    c = db.get(models.Client, p.client_id)
    pkg = db.get(models.Package, p.package_id)
    return {
        "id": p.id,
        "studio_id": p.studio_id,
        "client_id": p.client_id,
        "package_id": p.package_id,
        "amount": p.amount,
        "currency": p.currency,
        "status": p.status,
        "gateway": p.gateway,
        "payment_url": p.payment_url,
        "method": p.method,
        "subscription_id": p.subscription_id,
        "created_at": p.created_at,
        "paid_at": p.paid_at,
        "client_name": c.name_ar if c else None,
        "client_phone": c.phone if c else None,
        "package_name": pkg.name_ar if pkg else None,
    }


def _sync_payment(db, p: models.Payment) -> str:
    """Re-fetch the charge from Tap and update the payment. Returns the Tap status."""
    charge = tap.get_charge(p.charge_id)
    status = (charge.get("status") or "").upper()
    src = charge.get("source") or {}
    p.method = src.get("payment_method") or src.get("type") or src.get("id") or p.method

    if status == PAID_STATUS:
        if p.status != "paid":
            p.status = "paid"
            p.paid_at = datetime.utcnow()
            if not p.subscription_id:
                try:
                    sub = create_subscription_for(db, p.studio_id, p.client_id, p.package_id, price_paid=p.amount)
                    p.subscription_id = sub.id
                except Exception:
                    pass
    elif status in FAILED_STATUSES:
        if p.status == "pending":
            p.status = "failed"

    db.commit()
    db.refresh(p)
    return status


@router.post("", response_model=schemas.PaymentOut, status_code=201)
def create_payment(payload: schemas.PaymentCreate, db: DB, user: CurrentUser):
    studio_id = user.studio_id
    client = db.get(models.Client, payload.client_id)
    if not client or client.studio_id != studio_id:
        raise HTTPException(400, "العميل غير موجود")
    pkg = db.get(models.Package, payload.package_id)
    if not pkg or pkg.studio_id != studio_id:
        raise HTTPException(400, "الباقة غير موجودة")
    if not settings.tap_secret_key:
        raise HTTPException(400, "لم يتم ضبط مفتاح بوابة الدفع (TAP_SECRET_KEY)")

    amount = payload.amount if payload.amount is not None else pkg.price

    p = models.Payment(
        studio_id=studio_id, client_id=client.id, package_id=pkg.id,
        amount=amount, currency="SAR", status="pending", gateway="tap",
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    try:
        charge = tap.create_charge(
            amount=amount,
            currency="SAR",
            customer_name=client.name_ar,
            customer_phone=client.phone,
            customer_email=client.email,
            description=f"{pkg.name_ar} — {client.name_ar}",
            metadata={"payment_id": str(p.id), "client_id": str(client.id), "package_id": str(pkg.id)},
            redirect_url=f"{settings.public_base_url}/api/payments/callback",
            post_url=f"{settings.public_base_url}/api/payments/webhook/tap",
        )
    except Exception as e:
        db.delete(p)
        db.commit()
        raise HTTPException(502, f"تعذّر إنشاء رابط الدفع: {e}")

    p.charge_id = charge.get("id")
    tx = charge.get("transaction") or {}
    p.payment_url = tx.get("url")
    db.commit()
    db.refresh(p)
    return _serialize(p, db)


@router.get("", response_model=list[schemas.PaymentOut])
def list_payments(db: DB, studio_id: StudioId, limit: int = 200):
    rows = db.scalars(
        select(models.Payment)
        .where(models.Payment.studio_id == studio_id)
        .order_by(models.Payment.id.desc())
        .limit(limit)
    ).all()
    return [_serialize(p, db) for p in rows]


@router.get("/{payment_id}", response_model=schemas.PaymentOut)
def get_payment(payment_id: int, db: DB, studio_id: StudioId):
    p = db.get(models.Payment, payment_id)
    if not p or p.studio_id != studio_id:
        raise HTTPException(404)
    return _serialize(p, db)


@router.post("/{payment_id}/refresh", response_model=schemas.PaymentOut)
def refresh_payment(payment_id: int, db: DB, studio_id: StudioId):
    p = db.get(models.Payment, payment_id)
    if not p or p.studio_id != studio_id:
        raise HTTPException(404)
    if p.charge_id:
        _sync_payment(db, p)
    return _serialize(p, db)


@router.post("/webhook/tap")
def tap_webhook(db: DB, payload: dict = Body(default={})):
    charge_id = payload.get("id")
    if charge_id:
        p = db.scalar(select(models.Payment).where(models.Payment.charge_id == charge_id))
        if p:
            _sync_payment(db, p)
    return {"ok": True}


@router.get("/callback")
def tap_callback(db: DB, tap_id: str | None = Query(default=None)):
    status_q = "unknown"
    if tap_id:
        p = db.scalar(select(models.Payment).where(models.Payment.charge_id == tap_id))
        if p:
            _sync_payment(db, p)
            status_q = p.status  # paid / failed / pending
    return RedirectResponse(url=f"/pay/result?status={status_q}", status_code=303)
