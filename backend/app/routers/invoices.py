from datetime import datetime

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from .. import models, schemas
from ..deps import DB, StudioId
from ..services import zatca as zatca_svc


router = APIRouter(prefix="/api/invoices", tags=["invoices"])


def _next_number(db, studio_id: int) -> str:
    last = db.scalar(
        select(models.Invoice)
        .where(models.Invoice.studio_id == studio_id)
        .order_by(models.Invoice.id.desc())
    )
    n = (last.id + 1) if last else 1
    return f"INV-{datetime.utcnow().year}-{n:06d}"


def _serialize(inv: models.Invoice, db) -> dict:
    client_name = None
    if inv.client_id:
        c = db.get(models.Client, inv.client_id)
        client_name = c.name_ar if c else None
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "invoice_type": inv.invoice_type,
        "issue_date": inv.issue_date,
        "description": inv.description,
        "subtotal": inv.subtotal,
        "vat_rate": inv.vat_rate,
        "vat_amount": inv.vat_amount,
        "total": inv.total,
        "currency": inv.currency,
        "zatca_status": inv.zatca_status,
        "qr_base64": inv.qr_base64,
        "invoice_hash": inv.invoice_hash,
        "client_id": inv.client_id,
        "client_name": client_name,
    }


@router.get("")
def list_invoices(db: DB, studio_id: StudioId, limit: int = 100):
    rows = db.scalars(
        select(models.Invoice)
        .where(models.Invoice.studio_id == studio_id)
        .order_by(models.Invoice.id.desc())
        .limit(limit)
    ).all()
    return [_serialize(i, db) for i in rows]


@router.get("/{invoice_id}")
def get_invoice(invoice_id: int, db: DB, studio_id: StudioId):
    inv = db.get(models.Invoice, invoice_id)
    if not inv or inv.studio_id != studio_id:
        raise HTTPException(404)
    return _serialize(inv, db)


@router.get("/{invoice_id}/xml")
def get_invoice_xml(invoice_id: int, db: DB, studio_id: StudioId):
    inv = db.get(models.Invoice, invoice_id)
    if not inv or inv.studio_id != studio_id:
        raise HTTPException(404)
    if not inv.xml_signed:
        raise HTTPException(400, "الفاتورة لم تُولّد بعد")
    from fastapi.responses import Response
    return Response(content=inv.xml_signed, media_type="application/xml")


@router.post("", status_code=201)
def create_invoice(payload: schemas.InvoiceCreate, db: DB, studio_id: StudioId):
    studio = db.get(models.Studio, studio_id)
    if not studio:
        raise HTTPException(400)

    # Validate client (optional for B2C/simplified)
    client = None
    if payload.client_id:
        client = db.get(models.Client, payload.client_id)
        if not client or client.studio_id != studio_id:
            raise HTTPException(400, "العميل غير موجود")

    # Compute totals
    items_dicts = [item.model_dump() for item in payload.items]
    subtotal = sum(i["quantity"] * i["unit_price"] for i in items_dicts)
    vat_rate = 15.0
    vat_amount = round(subtotal * vat_rate / 100, 2)
    total = round(subtotal + vat_amount, 2)

    # Find previous hash (chain)
    prev = db.scalar(
        select(models.Invoice).where(models.Invoice.studio_id == studio_id).order_by(models.Invoice.id.desc())
    )
    previous_hash = prev.invoice_hash if prev and prev.invoice_hash else "0"

    invoice_number = _next_number(db, studio_id)
    issue_date = datetime.utcnow()

    # Generate XML (UBL 2.1)
    xml = zatca_svc.build_invoice_xml(
        invoice_number=invoice_number,
        invoice_type=payload.invoice_type,
        issue_date=issue_date,
        seller_name=studio.name_ar,
        seller_vat=studio.vat or "300000000000003",
        seller_cr=studio.cr,
        seller_address=f"{studio.city or ''} • {studio.branch or ''}".strip(" •"),
        buyer_name=client.name_ar if client else None,
        buyer_vat=None,
        items=items_dicts,
        subtotal=subtotal,
        vat_rate=vat_rate,
        vat_amount=vat_amount,
        total=total,
        previous_hash=previous_hash,
    )
    invoice_hash = zatca_svc.compute_invoice_hash(xml)

    # Generate TLV QR
    tlv = zatca_svc.build_tlv_qr(
        seller_name=studio.name_ar,
        vat_number=studio.vat or "300000000000003",
        timestamp=issue_date,
        total_with_vat=total,
        vat_amount=vat_amount,
    )
    qr_b64 = zatca_svc.qr_to_png_base64(tlv)

    # Submit to ZATCA (sandbox stub)
    zatca_resp = zatca_svc.submit_to_zatca_sandbox(xml, invoice_hash)

    inv = models.Invoice(
        studio_id=studio_id,
        client_id=client.id if client else None,
        invoice_number=invoice_number,
        invoice_type=payload.invoice_type,
        issue_date=issue_date,
        description=payload.description,
        subtotal=subtotal,
        vat_rate=vat_rate,
        vat_amount=vat_amount,
        total=total,
        currency="SAR",
        xml_signed=xml,
        qr_base64=qr_b64,
        invoice_hash=invoice_hash,
        previous_hash=previous_hash,
        zatca_status=zatca_resp.get("status", "pending"),
        zatca_response=zatca_resp,
        items=items_dicts,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    return {
        **_serialize(inv, db),
        "zatca_response": zatca_resp,
    }
