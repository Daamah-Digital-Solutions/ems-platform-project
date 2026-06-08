"""All ORM models for the MOVE backend.

Multi-tenant by studio_id. Every operational table carries studio_id.
"""
from __future__ import annotations

from datetime import datetime, date, time
from typing import Optional
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Date,
    Time,
    ForeignKey,
    Text,
    JSON,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


# ----------- Studio (tenant) -----------
class Studio(Base):
    __tablename__ = "studios"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_ar: Mapped[str] = mapped_column(String(200))
    name_en: Mapped[str | None] = mapped_column(String(200), nullable=True)
    city: Mapped[str | None] = mapped_column(String(60), nullable=True)
    branch: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    plan: Mapped[str] = mapped_column(String(40), default="trial")
    studio_type: Mapped[str | None] = mapped_column(String(20), nullable=True)  # men/women/mixed
    branches: Mapped[str | None] = mapped_column(String(10), nullable=True)
    vat: Mapped[str | None] = mapped_column(String(20), nullable=True)
    cr: Mapped[str | None] = mapped_column(String(20), nullable=True)
    logo: Mapped[str | None] = mapped_column(String(10), nullable=True)
    working_hours: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ramadan_mode: Mapped[bool] = mapped_column(Boolean, default=True)
    block_prayer: Mapped[bool] = mapped_column(Boolean, default=True)
    prayer_buffer_min: Mapped[int] = mapped_column(Integer, default=10)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)



# ----------- User -----------
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    name_ar: Mapped[str] = mapped_column(String(120))
    name_en: Mapped[str | None] = mapped_column(String(120), nullable=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    role: Mapped[str] = mapped_column(String(40), default="owner")  # owner, manager, staff
    password_hash: Mapped[str] = mapped_column(String(200))
    initials: Mapped[str | None] = mapped_column(String(4), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)



# ----------- Trainer -----------
class Trainer(Base):
    __tablename__ = "trainers"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    name_ar: Mapped[str] = mapped_column(String(120))
    initials: Mapped[str | None] = mapped_column(String(4), nullable=True)
    specialty: Mapped[str | None] = mapped_column(String(120), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    certification: Mapped[str | None] = mapped_column(String(60), nullable=True)
    cert_expiry: Mapped[str | None] = mapped_column(String(20), nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=4.5)
    month_sessions: Mapped[int] = mapped_column(Integer, default=0)
    conversion_rate: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="متاح")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Machine -----------
class Machine(Base):
    __tablename__ = "machines"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    label: Mapped[str] = mapped_column(String(40))
    model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="متاح")
    total_sessions: Mapped[int] = mapped_column(Integer, default=0)
    last_service: Mapped[str | None] = mapped_column(String(20), nullable=True)
    next_service: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Suit -----------
class Suit(Base):
    __tablename__ = "suits"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    label: Mapped[str] = mapped_column(String(40))
    size: Mapped[str] = mapped_column(String(4))  # S, M, L, XL
    status: Mapped[str] = mapped_column(String(30), default="متاح")
    washes: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Package template -----------
class Package(Base):
    __tablename__ = "packages"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    name_ar: Mapped[str] = mapped_column(String(120))
    sessions: Mapped[int] = mapped_column(Integer)  # 999 = unlimited
    duration_months: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Float)
    unlimited: Mapped[bool] = mapped_column(Boolean, default=False)
    color: Mapped[str | None] = mapped_column(String(80), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Client -----------
class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    name_ar: Mapped[str] = mapped_column(String(160), index=True)
    name_en: Mapped[str | None] = mapped_column(String(160), nullable=True)
    phone: Mapped[str] = mapped_column(String(40), index=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="نشط")  # نشط/تجريبي/مجمد/منتهي
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    suit_size: Mapped[str | None] = mapped_column(String(4), nullable=True)
    preferred_trainer_id: Mapped[int | None] = mapped_column(ForeignKey("trainers.id"), nullable=True)
    parq_status: Mapped[str] = mapped_column(String(20), default="ساري")
    parq_expiry: Mapped[str | None] = mapped_column(String(20), nullable=True)
    parq_flags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    last_session: Mapped[str | None] = mapped_column(String(40), nullable=True)
    join_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Subscription -----------
class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True)
    package_id: Mapped[int] = mapped_column(ForeignKey("packages.id"), index=True)
    start_date: Mapped[date] = mapped_column(Date, default=date.today)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    sessions_total: Mapped[int] = mapped_column(Integer)
    sessions_remaining: Mapped[int] = mapped_column(Integer)
    price_paid: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="نشطة")  # نشطة/مجمدة/منتهية/ملغية
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Booking -----------
class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        Index("ix_booking_studio_start", "studio_id", "start_time"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True)
    trainer_id: Mapped[int] = mapped_column(ForeignKey("trainers.id"))
    machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id"))
    suit_id: Mapped[int | None] = mapped_column(ForeignKey("suits.id"), nullable=True)
    subscription_id: Mapped[int | None] = mapped_column(ForeignKey("subscriptions.id"), nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, index=True)
    duration_min: Mapped[int] = mapped_column(Integer, default=20)
    status: Mapped[str] = mapped_column(String(20), default="مؤكد")  # مؤكد/جاري/مكتمل/لم يحضر/ملغي
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    parq_ack_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Lead (public website intake) -----------
class Lead(Base):
    """Booking/contact request submitted from the public marketing website.

    Kept separate from Booking on purpose: a public request has no assigned
    trainer/machine/slot yet, so it must not enter the booking conflict engine.
    The team reviews a Lead in the CRM and converts it into a Client + Booking.
    """
    __tablename__ = "leads"
    __table_args__ = (
        Index("ix_lead_studio_status", "studio_id", "status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(40), index=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    area: Mapped[str | None] = mapped_column(String(120), nullable=True)  # المنطقة/الحي
    package_id: Mapped[int | None] = mapped_column(ForeignKey("packages.id"), nullable=True)
    package_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    preferred_time: Mapped[str | None] = mapped_column(String(120), nullable=True)  # نص حر: تفضيل العميل
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(40), default="website")
    status: Mapped[str] = mapped_column(String(20), default="جديد")  # جديد/تم التواصل/محوّل/مغلق
    client_id: Mapped[int | None] = mapped_column(ForeignKey("clients.id"), nullable=True)  # بعد التحويل
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Note -----------
class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ----------- Invoice (ZATCA) -----------
class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    studio_id: Mapped[int] = mapped_column(ForeignKey("studios.id"), index=True)
    client_id: Mapped[int | None] = mapped_column(ForeignKey("clients.id"), nullable=True)
    invoice_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    invoice_type: Mapped[str] = mapped_column(String(10), default="standard")  # standard, simplified
    issue_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subtotal: Mapped[float] = mapped_column(Float)
    vat_rate: Mapped[float] = mapped_column(Float, default=15.0)
    vat_amount: Mapped[float] = mapped_column(Float)
    total: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="SAR")
    xml_signed: Mapped[str | None] = mapped_column(Text, nullable=True)
    qr_base64: Mapped[str | None] = mapped_column(Text, nullable=True)
    invoice_hash: Mapped[str | None] = mapped_column(String(120), nullable=True)
    previous_hash: Mapped[str | None] = mapped_column(String(120), nullable=True)
    zatca_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/cleared/rejected
    zatca_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    items: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
