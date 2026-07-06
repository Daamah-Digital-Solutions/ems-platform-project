"""Payment links — per-studio, via Moyasar (default) or Tap (fallback).

Staff create a payment for a client + package → we open a hosted payment page with
the studio's OWN gateway credentials and store the URL to send to the client. The
gateway calls our webhook and redirects the browser to our callback; in both cases
we re-fetch the invoice/charge from the gateway to confirm status (never trust the
payload). On a paid/captured payment we activate the client's subscription.
"""
from datetime import datetime

from fastapi import APIRouter, HTTPException, Body, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from .. import models, schemas
from ..deps import DB, CurrentUser, StudioId
from ..config import settings
from ..services import tap, moyasar
from .packages import create_subscription_for


router = APIRouter(prefix="/api/payments", tags=["payments"])

# Tap charge statuses
TAP_PAID = "CAPTURED"
TAP_FAILED = {"FAILED", "DECLINED", "ABANDONED", "CANCELLED", "VOID", "TIMEDOUT", "EXPIRED"}
# Moyasar invoice statuses
MOYASAR_FAILED = {"canceled", "expired", "failed"}


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


def _mark_paid(db, p: models.Payment):
    """Flag the payment as paid and activate the subscription (idempotent)."""
    if p.status != "paid":
        p.status = "paid"
        p.paid_at = datetime.utcnow()
        if not p.subscription_id:
            try:
                sub = create_subscription_for(db, p.studio_id, p.client_id, p.package_id, price_paid=p.amount)
                p.subscription_id = sub.id
            except Exception:
                pass


def _sync_payment(db, p: models.Payment) -> str:
    """Re-fetch the invoice/charge from the gateway and update the payment."""
    if p.gateway == "moyasar":
        studio = db.get(models.Studio, p.studio_id)
        if not studio or not studio.moyasar_secret_key:
            return p.status
        inv = moyasar.get_invoice(secret_key=studio.moyasar_secret_key, invoice_id=p.charge_id)
        status = (inv.get("status") or "").lower()
        pays = inv.get("payments") or []
        if pays:
            p.method = (pays[0].get("source") or {}).get("type") or p.method
        if status == "paid":
            _mark_paid(db, p)
        elif status in MOYASAR_FAILED and p.status == "pending":
            p.status = "failed"
    else:  # tap
        charge = tap.get_charge(p.charge_id)
        status = (charge.get("status") or "").upper()
        src = charge.get("source") or {}
        p.method = src.get("payment_method") or src.get("type") or src.get("id") or p.method
        if status == TAP_PAID:
            _mark_paid(db, p)
        elif status in TAP_FAILED and p.status == "pending":
            p.status = "failed"
    db.commit()
    db.refresh(p)
    return p.status


@router.post("", response_model=schemas.PaymentOut, status_code=201)
def create_payment(payload: schemas.PaymentCreate, db: DB, user: CurrentUser):
    studio_id = user.studio_id
    studio = db.get(models.Studio, studio_id)
    client = db.get(models.Client, payload.client_id)
    if not client or client.studio_id != studio_id:
        raise HTTPException(400, "العميل غير موجود")
    pkg = db.get(models.Package, payload.package_id)
    if not pkg or pkg.studio_id != studio_id:
        raise HTTPException(400, "الباقة غير موجودة")

    gateway = (studio.payment_gateway or "moyasar")
    if gateway == "moyasar":
        if not studio.payments_enabled or not studio.moyasar_secret_key:
            raise HTTPException(400, "الدفع غير مفعّل. فعّل بوابة الدفع (ميسر) من الإعدادات.")
    elif gateway == "tap":
        if not settings.tap_secret_key:
            raise HTTPException(400, "لم يتم ضبط مفتاح بوابة الدفع (Tap)")
    else:
        raise HTTPException(400, "بوابة دفع غير مدعومة")

    amount = payload.amount if payload.amount is not None else pkg.price

    p = models.Payment(
        studio_id=studio_id, client_id=client.id, package_id=pkg.id,
        amount=amount, currency="SAR", status="pending", gateway=gateway,
    )
    db.add(p)
    db.commit()
    db.refresh(p)

    try:
        meta = {"payment_id": str(p.id), "client_id": str(client.id), "package_id": str(pkg.id)}
        if gateway == "moyasar":
            inv = moyasar.create_invoice(
                secret_key=studio.moyasar_secret_key,
                amount=amount,
                currency="SAR",
                description=f"{pkg.name_ar} — {client.name_ar}",
                callback_url=f"{settings.public_base_url}/api/payments/callback",
                metadata=meta,
            )
            p.charge_id = inv.get("id")
            p.payment_url = inv.get("url")
        else:  # tap
            charge = tap.create_charge(
                amount=amount, currency="SAR",
                customer_name=client.name_ar, customer_phone=client.phone, customer_email=client.email,
                description=f"{pkg.name_ar} — {client.name_ar}",
                metadata=meta,
                redirect_url=f"{settings.public_base_url}/api/payments/callback",
                post_url=f"{settings.public_base_url}/api/payments/webhook/tap",
            )
            p.charge_id = charge.get("id")
            p.payment_url = (charge.get("transaction") or {}).get("url")
    except Exception as e:
        db.delete(p)
        db.commit()
        raise HTTPException(502, f"تعذّر إنشاء رابط الدفع: {e}")

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
        try:
            _sync_payment(db, p)
        except Exception:
            pass
    return _serialize(p, db)


def _find_and_sync(db, *ids):
    for cid in ids:
        if not cid:
            continue
        p = db.scalar(select(models.Payment).where(models.Payment.charge_id == str(cid)))
        if p:
            try:
                _sync_payment(db, p)
            except Exception:
                pass
            return p
    return None


@router.post("/webhook/moyasar")
def moyasar_webhook(db: DB, payload: dict = Body(default={})):
    data = payload.get("data") or {}
    _find_and_sync(db, data.get("id"), data.get("invoice_id"), payload.get("id"))
    return {"ok": True}


@router.post("/webhook/tap")
def tap_webhook(db: DB, payload: dict = Body(default={})):
    _find_and_sync(db, payload.get("id"))
    return {"ok": True}


@router.get("/callback")
def payment_callback(
    db: DB,
    invoice_id: str | None = Query(default=None),
    tap_id: str | None = Query(default=None),
    id: str | None = Query(default=None),
):
    p = _find_and_sync(db, invoice_id, tap_id, id)
    status_q = p.status if p else "unknown"
    return RedirectResponse(url=f"/pay/result?status={status_q}", status_code=303)
