"""Public, customer-facing endpoints for the marketing website (emselriyadh.com).

Authentication is a single static API key (header `X-API-Key`), NOT a user JWT.
Every submission is filed under `settings.public_studio_id`. These endpoints are
intentionally the only ones the public site is allowed to reach.
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from .. import models, schemas
from ..deps import DB, PublicStudioId


router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/packages", response_model=list[schemas.PublicPackageOut])
def public_packages(db: DB, studio_id: PublicStudioId):
    """Active packages with prices, safe to render on the website."""
    rows = db.scalars(
        select(models.Package)
        .where(models.Package.studio_id == studio_id, models.Package.is_active == True)  # noqa: E712
        .order_by(models.Package.price.asc())
    ).all()
    return rows


@router.post("/leads", response_model=schemas.LeadOut, status_code=201)
def create_lead(payload: schemas.LeadCreate, db: DB, studio_id: PublicStudioId):
    """Receive a booking/contact request from the website.

    Creates a Lead in status `جديد`. Does NOT create a Client or Booking — the team
    reviews and converts it from the CRM (POST /api/leads/{id}/convert).
    """
    # Resolve package name if a valid package_id was sent
    package_name = payload.package
    if payload.package_id:
        pkg = db.get(models.Package, payload.package_id)
        if pkg and pkg.studio_id == studio_id:
            package_name = pkg.name_ar
        else:
            # Unknown package for this studio: ignore the id, keep any free-text name
            payload.package_id = None

    lead = models.Lead(
        studio_id=studio_id,
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        email=payload.email,
        area=payload.area,
        package_id=payload.package_id,
        package_name=package_name,
        preferred_time=payload.preferred_time,
        note=payload.note,
        source=payload.source or "website",
        status="جديد",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead
