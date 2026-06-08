from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from .. import models, schemas
from ..deps import DB, StudioId


router = APIRouter(prefix="/api", tags=["resources"])


# ----- Machines -----
@router.get("/machines", response_model=list[schemas.MachineOut])
def list_machines(db: DB, studio_id: StudioId):
    return db.scalars(
        select(models.Machine).where(models.Machine.studio_id == studio_id, models.Machine.is_active == True)
    ).all()


@router.post("/machines", response_model=schemas.MachineOut, status_code=201)
def create_machine(payload: schemas.MachineCreate, db: DB, studio_id: StudioId):
    m = models.Machine(studio_id=studio_id, **payload.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.patch("/machines/{machine_id}", response_model=schemas.MachineOut)
def update_machine(machine_id: int, payload: schemas.MachineUpdate, db: DB, studio_id: StudioId):
    m = db.get(models.Machine, machine_id)
    if not m or m.studio_id != studio_id:
        raise HTTPException(404)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


# ----- Suits -----
@router.get("/suits", response_model=list[schemas.SuitOut])
def list_suits(db: DB, studio_id: StudioId, size: str | None = None):
    stmt = select(models.Suit).where(models.Suit.studio_id == studio_id, models.Suit.is_active == True)
    if size and size != "all":
        stmt = stmt.where(models.Suit.size == size)
    return db.scalars(stmt).all()


@router.post("/suits", response_model=schemas.SuitOut, status_code=201)
def create_suit(payload: schemas.SuitCreate, db: DB, studio_id: StudioId):
    s = models.Suit(studio_id=studio_id, **payload.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.patch("/suits/{suit_id}", response_model=schemas.SuitOut)
def update_suit(suit_id: int, payload: schemas.SuitUpdate, db: DB, studio_id: StudioId):
    s = db.get(models.Suit, suit_id)
    if not s or s.studio_id != studio_id:
        raise HTTPException(404)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s
