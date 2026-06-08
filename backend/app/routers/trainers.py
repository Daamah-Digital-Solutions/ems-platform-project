from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from .. import models, schemas
from ..deps import DB, StudioId


router = APIRouter(prefix="/api/trainers", tags=["trainers"])


@router.get("", response_model=list[schemas.TrainerOut])
def list_trainers(db: DB, studio_id: StudioId):
    return db.scalars(
        select(models.Trainer).where(models.Trainer.studio_id == studio_id, models.Trainer.is_active == True)
    ).all()


@router.get("/{trainer_id}", response_model=schemas.TrainerOut)
def get_trainer(trainer_id: int, db: DB, studio_id: StudioId):
    t = db.get(models.Trainer, trainer_id)
    if not t or t.studio_id != studio_id:
        raise HTTPException(404)
    return t


@router.post("", response_model=schemas.TrainerOut, status_code=201)
def create_trainer(payload: schemas.TrainerCreate, db: DB, studio_id: StudioId):
    data = payload.model_dump()
    if not data.get("initials") and data.get("name_ar"):
        parts = data["name_ar"].split()
        data["initials"] = "".join([p[0] for p in parts[:2]])
    t = models.Trainer(studio_id=studio_id, **data)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.patch("/{trainer_id}", response_model=schemas.TrainerOut)
def update_trainer(trainer_id: int, payload: schemas.TrainerUpdate, db: DB, studio_id: StudioId):
    t = db.get(models.Trainer, trainer_id)
    if not t or t.studio_id != studio_id:
        raise HTTPException(404)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/{trainer_id}", status_code=204)
def delete_trainer(trainer_id: int, db: DB, studio_id: StudioId):
    t = db.get(models.Trainer, trainer_id)
    if not t or t.studio_id != studio_id:
        raise HTTPException(404)
    t.is_active = False
    db.commit()
