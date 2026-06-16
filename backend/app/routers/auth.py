from datetime import datetime, date

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from .. import models, schemas
from ..deps import DB, CurrentUser
from ..security import hash_password, verify_password, create_access_token


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: DB):
    user = db.scalar(select(models.User).where(models.User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "بيانات الدخول غير صحيحة")
    studio = db.get(models.Studio, user.studio_id)
    token = create_access_token(user.id, user.studio_id, user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": schemas.UserOut.model_validate(user).model_dump(),
        "studio": schemas.StudioOut.model_validate(studio).model_dump(),
    }


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterStudioRequest, db: DB):
    # Check email isn't taken
    existing = db.scalar(select(models.User).where(models.User.email == payload.user_email.lower()))
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "البريد الإلكتروني مسجل مسبقاً")

    # Create studio
    studio = models.Studio(
        name_ar=payload.studio_name_ar,
        name_en=payload.studio_name_en,
        city=payload.city,
        phone=f"+966 {payload.phone}" if payload.phone else None,
        studio_type=payload.studio_type,
        branches=payload.branches,
        plan="trial",
        working_hours=payload.working_hours,
        ramadan_mode=payload.ramadan_mode,
        block_prayer=payload.block_prayer,
        prayer_buffer_min=payload.prayer_buffer_min,
        logo=payload.studio_name_ar[:2] if payload.studio_name_ar else "MO",
    )
    db.add(studio)
    db.flush()

    # Create user
    initials = "".join([w[0] for w in payload.user_name_ar.split()[:2]]) if payload.user_name_ar else None
    user = models.User(
        studio_id=studio.id,
        name_ar=payload.user_name_ar,
        email=payload.user_email.lower(),
        password_hash=hash_password(payload.user_password),
        role="owner",
        initials=initials,
    )
    db.add(user)

    # Bootstrap resources
    for i in range(1, payload.machines + 1):
        db.add(models.Machine(
            studio_id=studio.id,
            label=f"الجهاز #{i}",
            model="miha bodytec II",
            status="متاح",
        ))

    sizes = ["S", "M", "M", "M", "L", "L", "L", "XL", "S", "M", "L", "M", "L", "XL", "M"]
    for i in range(1, payload.suits + 1):
        db.add(models.Suit(
            studio_id=studio.id,
            label=f"البدلة #{i}",
            size=sizes[(i - 1) % len(sizes)],
            washes=0,
        ))

    # Default packages
    for tpl in [
        {"name_ar": "باقة التجربة", "sessions": 4, "duration_months": 1, "price": 799,
         "color": "bg-amber-50 text-amber-700"},
        {"name_ar": "الباقة الذهبية", "sessions": 24, "duration_months": 3, "price": 3900,
         "color": "bg-brand-50 text-brand"},
        {"name_ar": "الباقة البلاتينية", "sessions": 48, "duration_months": 6, "price": 6900,
         "color": "bg-indigo-50 text-indigo-700"},
        {"name_ar": "باقة VIP", "sessions": 999, "duration_months": 1, "price": 2500, "unlimited": True,
         "color": "bg-rose-50 text-rose-700"},
    ]:
        db.add(models.Package(studio_id=studio.id, **tpl))

    db.commit()
    db.refresh(user)
    db.refresh(studio)

    token = create_access_token(user.id, studio.id, user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": schemas.UserOut.model_validate(user).model_dump(),
        "studio": schemas.StudioOut.model_validate(studio).model_dump(),
    }


@router.get("/me", response_model=schemas.UserOut)
def me(user: CurrentUser):
    return user


@router.patch("/me", response_model=schemas.UserOut)
def update_me(payload: schemas.ProfileUpdate, db: DB, user: CurrentUser):
    """Let the logged-in user edit their own display name + honorific title."""
    data = payload.model_dump(exclude_unset=True)
    if data.get("name_ar"):
        user.name_ar = data["name_ar"].strip()
        user.initials = "".join([w[0] for w in user.name_ar.split()[:2]]) or user.initials
    if "title" in data:
        user.title = (data["title"] or None)
    if "name_en" in data:
        user.name_en = data["name_en"] or None
    if "phone" in data:
        user.phone = data["phone"] or None
    db.commit()
    db.refresh(user)
    return user
