"""Team-facing lead management (CRM side, JWT-protected).

The website drops requests via /api/public/leads. The team triages them here:
list new requests, mark contacted, and convert a qualified lead into a Client.
"""
from datetime import date

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select

from .. import models, schemas
from ..deps import DB, StudioId


router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("", response_model=list[schemas.LeadOut])
def list_leads(
    db: DB,
    studio_id: StudioId,
    status: str | None = Query(None, description="جديد/تم التواصل/محوّل/مغلق"),
    limit: int = 100,
):
    stmt = select(models.Lead).where(models.Lead.studio_id == studio_id)
    if status and status != "all":
        stmt = stmt.where(models.Lead.status == status)
    stmt = stmt.order_by(models.Lead.id.desc()).limit(limit)
    return db.scalars(stmt).all()


@router.get("/{lead_id}", response_model=schemas.LeadOut)
def get_lead(lead_id: int, db: DB, studio_id: StudioId):
    lead = db.get(models.Lead, lead_id)
    if not lead or lead.studio_id != studio_id:
        raise HTTPException(404, "الطلب غير موجود")
    return lead


@router.patch("/{lead_id}", response_model=schemas.LeadOut)
def update_lead(lead_id: int, payload: schemas.LeadUpdate, db: DB, studio_id: StudioId):
    lead = db.get(models.Lead, lead_id)
    if not lead or lead.studio_id != studio_id:
        raise HTTPException(404, "الطلب غير موجود")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(lead, k, v)
    db.commit()
    db.refresh(lead)
    return lead


@router.post("/{lead_id}/convert", status_code=201)
def convert_lead(lead_id: int, db: DB, studio_id: StudioId):
    """Turn a lead into a Client (deduping by phone). Marks the lead `محوّل`."""
    lead = db.get(models.Lead, lead_id)
    if not lead or lead.studio_id != studio_id:
        raise HTTPException(404, "الطلب غير موجود")
    if lead.client_id:
        raise HTTPException(400, "الطلب محوّل بالفعل")

    # Dedup: reuse an existing client with the same phone in this studio
    existing = db.scalar(
        select(models.Client).where(
            models.Client.studio_id == studio_id,
            models.Client.phone == lead.phone,
        )
    )
    if existing:
        client = existing
        created = False
    else:
        tags = []
        if lead.area:
            tags.append(lead.area)
        client = models.Client(
            studio_id=studio_id,
            name_ar=lead.name,
            phone=lead.phone,
            email=lead.email,
            status="تجريبي",
            tags=tags or None,
            join_date=date.today().strftime("%Y/%m/%d"),
        )
        db.add(client)
        db.flush()
        created = True

    lead.client_id = client.id
    lead.status = "محوّل"
    db.commit()
    db.refresh(client)
    return {
        "lead_id": lead.id,
        "client_id": client.id,
        "client_name": client.name_ar,
        "created": created,  # False => linked to an existing client
    }
