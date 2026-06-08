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


@router.patch("", response_model=schemas.StudioOut)
def update_studio(payload: schemas.StudioUpdate, db: DB, studio_id: StudioId):
    s = db.get(models.Studio, studio_id)
    if not s:
        raise HTTPException(404)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s
