from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import Base, engine
from .security import decode_token
from . import models  # noqa: F401  (register models)
from .routers import auth, clients, trainers, resources, packages, bookings, reports, studios, invoices, public, leads, payments
from .seed import ensure_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_seed()
    yield


app = FastAPI(
    title="MOVE API",
    description="نظام إدارة ستوديوهات EMS — Backend",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def readonly_viewer_guard(request: Request, call_next):
    """Block all writes for 'viewer' accounts (used for read-only shared links)."""
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        authz = request.headers.get("authorization", "")
        if authz.lower().startswith("bearer "):
            payload = decode_token(authz[7:])
            if payload and payload.get("role") == "viewer":
                return JSONResponse(status_code=403, content={"detail": "وضع العرض فقط — التعديل غير متاح"})
    return await call_next(request)


# Mount routers
app.include_router(auth.router)
app.include_router(studios.router)
app.include_router(clients.router)
app.include_router(trainers.router)
app.include_router(resources.router)
app.include_router(packages.router)
app.include_router(bookings.router)
app.include_router(reports.router)
app.include_router(invoices.router)
app.include_router(public.router)
app.include_router(leads.router)
app.include_router(payments.router)


@app.get("/")
def root():
    return {
        "name": "MOVE API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"ok": True}
