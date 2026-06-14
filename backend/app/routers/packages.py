from datetime import date, timedelta

from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func

from .. import models, schemas
from ..deps import DB, StudioId


router = APIRouter(prefix="/api", tags=["packages"])


@router.get("/packages", response_model=list[schemas.PackageOut])
def list_packages(db: DB, studio_id: StudioId):
    pkgs = db.scalars(
        select(models.Package).where(models.Package.studio_id == studio_id, models.Package.is_active == True)
    ).all()
    out = []
    for p in pkgs:
        active_subs = db.scalar(
            select(func.count(models.Subscription.id))
            .where(models.Subscription.package_id == p.id, models.Subscription.status == "نشطة")
        )
        d = schemas.PackageOut.model_validate(p).model_dump()
        d["active_subs"] = active_subs or 0
        out.append(d)
    return out


@router.post("/packages", response_model=schemas.PackageOut, status_code=201)
def create_package(payload: schemas.PackageCreate, db: DB, studio_id: StudioId):
    p = models.Package(studio_id=studio_id, **payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    d = schemas.PackageOut.model_validate(p).model_dump()
    d["active_subs"] = 0
    return d


@router.patch("/packages/{package_id}", response_model=schemas.PackageOut)
def update_package(package_id: int, payload: schemas.PackageUpdate, db: DB, studio_id: StudioId):
    p = db.get(models.Package, package_id)
    if not p or p.studio_id != studio_id:
        raise HTTPException(404)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    d = schemas.PackageOut.model_validate(p).model_dump()
    d["active_subs"] = 0
    return d


# ----- subscriptions -----
@router.get("/subscriptions")
def list_subscriptions(db: DB, studio_id: StudioId, status: str | None = None, limit: int = 200):
    stmt = select(models.Subscription).where(models.Subscription.studio_id == studio_id)
    if status:
        stmt = stmt.where(models.Subscription.status == status)
    rows = db.scalars(stmt.order_by(models.Subscription.id.desc()).limit(limit)).all()
    out = []
    for s in rows:
        c = db.get(models.Client, s.client_id)
        p = db.get(models.Package, s.package_id)
        out.append({
            "id": s.id,
            "client_id": s.client_id,
            "client_name": c.name_ar if c else None,
            "package_id": s.package_id,
            "package_name": p.name_ar if p else None,
            "start_date": s.start_date,
            "end_date": s.end_date,
            "sessions_total": s.sessions_total,
            "sessions_remaining": s.sessions_remaining,
            "price_paid": s.price_paid,
            "status": s.status,
        })
    return out


def create_subscription_for(db, studio_id, client_id, package_id, price_paid=None, start_date=None):
    """Create an active subscription for a client on a package. Reused by the
    subscriptions endpoint and by the payments flow on successful payment."""
    c = db.get(models.Client, client_id)
    if not c or c.studio_id != studio_id:
        raise HTTPException(400, "العميل غير موجود")
    p = db.get(models.Package, package_id)
    if not p or p.studio_id != studio_id:
        raise HTTPException(400, "الباقة غير موجودة")
    start = start_date or date.today()
    end = start + timedelta(days=p.duration_months * 30)
    s = models.Subscription(
        studio_id=studio_id,
        client_id=c.id,
        package_id=p.id,
        start_date=start,
        end_date=end,
        sessions_total=p.sessions,
        sessions_remaining=p.sessions,
        price_paid=price_paid if price_paid is not None else p.price,
        status="نشطة",
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.post("/subscriptions", response_model=schemas.SubscriptionOut, status_code=201)
def create_subscription(payload: schemas.SubscriptionCreate, db: DB, studio_id: StudioId):
    return create_subscription_for(
        db, studio_id, payload.client_id, payload.package_id,
        price_paid=payload.price_paid, start_date=payload.start_date,
    )


@router.post("/subscriptions/{sub_id}/freeze")
def freeze_subscription(sub_id: int, db: DB, studio_id: StudioId):
    s = db.get(models.Subscription, sub_id)
    if not s or s.studio_id != studio_id:
        raise HTTPException(404)
    s.status = "مجمدة" if s.status == "نشطة" else "نشطة"
    db.commit()
    return {"status": s.status}
