from fastapi import APIRouter, HTTPException

from .. import models, schemas
from ..deps import DB, CurrentUser, StudioId
from ..services import gateways


router = APIRouter(prefix="/api/studio", tags=["studio"])


@router.get("", response_model=schemas.StudioOut)
def get_studio(db: DB, studio_id: StudioId):
    s = db.get(models.Studio, studio_id)
    if not s:
        raise HTTPException(404)
    return s


@router.get("/payment-gateways")
def payment_gateways():
    """Catalog of supported gateways + their credential fields (for the Settings UI)."""
    return gateways.public_catalog()


PAYMENT_FIELDS = {"payment_gateway", "payments_enabled", "payment_config"}


@router.patch("", response_model=schemas.StudioOut)
def update_studio(payload: schemas.StudioUpdate, db: DB, user: CurrentUser):
    s = db.get(models.Studio, user.studio_id)
    if not s:
        raise HTTPException(404)
    data = payload.model_dump(exclude_unset=True)
    # Only owner/manager may change payment settings.
    if any(k in data for k in PAYMENT_FIELDS) and user.role not in ("owner", "manager"):
        raise HTTPException(403, "لا تملك صلاحية تعديل إعدادات الدفع")

    incoming_cfg = data.pop("payment_config", None)
    if incoming_cfg is not None:
        # Deep-merge per gateway; a blank secret never overwrites a stored one.
        current = dict(s.payment_config or {})
        for gw, fields in (incoming_cfg or {}).items():
            merged = dict(current.get(gw) or {})
            for k, v in (fields or {}).items():
                if k in gateways.SECRET_FIELDS and not str(v or "").strip():
                    continue
                merged[k] = v
            current[gw] = merged
        s.payment_config = current  # reassign so SQLAlchemy detects the JSON change

    for k, v in data.items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s
