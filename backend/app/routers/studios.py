from fastapi import APIRouter, HTTPException

from .. import models, schemas
from ..deps import DB, CurrentUser, StudioId


router = APIRouter(prefix="/api/studio", tags=["studio"])


@router.get("", response_model=schemas.StudioOut)
def get_studio(db: DB, studio_id: StudioId):
    s = db.get(models.Studio, studio_id)
    if not s:
        raise HTTPException(404)
    return s


PAYMENT_FIELDS = {"payment_gateway", "payments_enabled", "moyasar_secret_key", "moyasar_publishable_key"}


@router.patch("", response_model=schemas.StudioOut)
def update_studio(payload: schemas.StudioUpdate, db: DB, user: CurrentUser):
    s = db.get(models.Studio, user.studio_id)
    if not s:
        raise HTTPException(404)
    data = payload.model_dump(exclude_unset=True)
    # Only owner/manager may change payment settings.
    if any(k in data for k in PAYMENT_FIELDS) and user.role not in ("owner", "manager"):
        raise HTTPException(403, "لا تملك صلاحية تعديل إعدادات الدفع")
    for k, v in data.items():
        # Don't overwrite a stored secret with a blank value (UI sends '' when untouched).
        if k == "moyasar_secret_key" and not (v or "").strip():
            continue
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s
