from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .security import decode_token
from . import models


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> models.User:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.get(models.User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


CurrentUser = Annotated[models.User, Depends(get_current_user)]
DB = Annotated[Session, Depends(get_db)]


def get_studio_id(user: CurrentUser) -> int:
    return user.studio_id


StudioId = Annotated[int, Depends(get_studio_id)]


def require_public_api_key(x_api_key: Annotated[str | None, Header(alias="X-API-Key")] = None) -> int:
    """Guard for public website endpoints. Returns the studio_id submissions belong to."""
    if not x_api_key or x_api_key != settings.public_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="مفتاح API غير صالح")
    return settings.public_studio_id


PublicStudioId = Annotated[int, Depends(require_public_api_key)]
