from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
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
