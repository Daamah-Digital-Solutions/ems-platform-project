"""Pydantic schemas for request/response."""
from __future__ import annotations

from datetime import datetime, date
from typing import Optional, Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


def _config():
    return ConfigDict(from_attributes=True)


# -------- Auth --------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterStudioRequest(BaseModel):
    studio_name_ar: str
    studio_name_en: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    studio_type: Optional[str] = None
    branches: Optional[str] = None
    user_name_ar: str
    user_email: EmailStr
    user_password: str = Field(min_length=4)
    working_hours: Optional[dict] = None
    ramadan_mode: bool = True
    block_prayer: bool = True
    prayer_buffer_min: int = 10
    machines: int = 5
    trainers: int = 8
    suits: int = 15


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    studio: dict


# -------- Studio --------
class StudioOut(BaseModel):
    model_config = _config()
    id: int
    name_ar: str
    name_en: Optional[str]
    city: Optional[str]
    branch: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    plan: str
    studio_type: Optional[str]
    vat: Optional[str]
    cr: Optional[str]
    logo: Optional[str]
    ramadan_mode: bool
    block_prayer: bool
    prayer_buffer_min: int


class StudioUpdate(BaseModel):
    name_ar: Optional[str] = None
    name_en: Optional[str] = None
    city: Optional[str] = None
    branch: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    vat: Optional[str] = None
    cr: Optional[str] = None
    ramadan_mode: Optional[bool] = None
    block_prayer: Optional[bool] = None
    prayer_buffer_min: Optional[int] = None
    working_hours: Optional[dict] = None


# -------- User --------
class UserOut(BaseModel):
    model_config = _config()
    id: int
    studio_id: int
    name_ar: str
    name_en: Optional[str]
    email: str
    phone: Optional[str]
    role: str
    initials: Optional[str]


# -------- Trainer --------
class TrainerBase(BaseModel):
    name_ar: str
    initials: Optional[str] = None
    specialty: Optional[str] = None
    gender: Optional[str] = None
    certification: Optional[str] = None
    cert_expiry: Optional[str] = None
    rating: float = 4.5
    status: str = "متاح"


class TrainerCreate(TrainerBase):
    pass


class TrainerUpdate(BaseModel):
    name_ar: Optional[str] = None
    specialty: Optional[str] = None
    certification: Optional[str] = None
    cert_expiry: Optional[str] = None
    rating: Optional[float] = None
    status: Optional[str] = None


class TrainerOut(TrainerBase):
    model_config = _config()
    id: int
    studio_id: int
    month_sessions: int
    conversion_rate: int


# -------- Machine --------
class MachineBase(BaseModel):
    label: str
    model: Optional[str] = None
    status: str = "متاح"
    last_service: Optional[str] = None
    next_service: Optional[str] = None


class MachineCreate(MachineBase):
    pass


class MachineUpdate(BaseModel):
    label: Optional[str] = None
    model: Optional[str] = None
    status: Optional[str] = None
    last_service: Optional[str] = None
    next_service: Optional[str] = None


class MachineOut(MachineBase):
    model_config = _config()
    id: int
    studio_id: int
    total_sessions: int


# -------- Suit --------
class SuitBase(BaseModel):
    label: str
    size: str
    status: str = "متاح"
    washes: int = 0


class SuitCreate(SuitBase):
    pass


class SuitUpdate(BaseModel):
    status: Optional[str] = None
    washes: Optional[int] = None


class SuitOut(SuitBase):
    model_config = _config()
    id: int
    studio_id: int


# -------- Package --------
class PackageBase(BaseModel):
    name_ar: str
    sessions: int
    duration_months: int
    price: float
    unlimited: bool = False
    color: Optional[str] = None


class PackageCreate(PackageBase):
    pass


class PackageUpdate(BaseModel):
    name_ar: Optional[str] = None
    sessions: Optional[int] = None
    duration_months: Optional[int] = None
    price: Optional[float] = None
    unlimited: Optional[bool] = None


class PackageOut(PackageBase):
    model_config = _config()
    id: int
    studio_id: int
    active_subs: int = 0


# -------- Client --------
class ClientBase(BaseModel):
    name_ar: str
    name_en: Optional[str] = None
    phone: str
    email: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    status: str = "نشط"
    tags: Optional[list] = None
    suit_size: Optional[str] = None
    preferred_trainer_id: Optional[int] = None
    parq_status: str = "ساري"
    parq_expiry: Optional[str] = None
    parq_flags: Optional[list] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name_ar: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[list] = None
    suit_size: Optional[str] = None
    preferred_trainer_id: Optional[int] = None
    parq_status: Optional[str] = None
    parq_expiry: Optional[str] = None
    parq_flags: Optional[list] = None


class ClientOut(ClientBase):
    model_config = _config()
    id: int
    studio_id: int
    last_session: Optional[str]
    join_date: Optional[str]
    # computed
    active_package: Optional[str] = None
    remaining: Optional[int | str] = None
    total: Optional[int] = None
    next_booking: Optional[str] = None
    preferred_trainer_name: Optional[str] = None


# -------- Subscription --------
class SubscriptionCreate(BaseModel):
    client_id: int
    package_id: int
    start_date: Optional[date] = None
    price_paid: Optional[float] = None


class SubscriptionOut(BaseModel):
    model_config = _config()
    id: int
    client_id: int
    package_id: int
    start_date: date
    end_date: Optional[date]
    sessions_total: int
    sessions_remaining: int
    price_paid: float
    status: str


# -------- Booking --------
class BookingCreate(BaseModel):
    client_id: int
    trainer_id: int
    machine_id: int
    suit_id: Optional[int] = None
    start_time: datetime
    duration_min: int = 20
    note: Optional[str] = None
    parq_ack: bool = False


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None
    start_time: Optional[datetime] = None


class BookingOut(BaseModel):
    model_config = _config()
    id: int
    studio_id: int
    client_id: int
    trainer_id: int
    machine_id: int
    suit_id: Optional[int]
    start_time: datetime
    duration_min: int
    status: str
    note: Optional[str]
    # joins
    client_name: Optional[str] = None
    trainer_name: Optional[str] = None
    machine_label: Optional[str] = None


# -------- Lead (public website intake) --------
class LeadCreate(BaseModel):
    """Payload the public website POSTs. Only name + phone are required."""
    name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=6, max_length=40)
    email: Optional[EmailStr] = None
    area: Optional[str] = Field(None, max_length=120)
    package_id: Optional[int] = None
    package: Optional[str] = Field(None, max_length=120)  # اسم الباقة لو مفيش id
    preferred_time: Optional[str] = Field(None, max_length=120)
    note: Optional[str] = Field(None, max_length=1000)
    source: Optional[str] = Field("website", max_length=40)


class LeadOut(BaseModel):
    model_config = _config()
    id: int
    studio_id: int
    name: str
    phone: str
    email: Optional[str]
    area: Optional[str]
    package_id: Optional[int]
    package_name: Optional[str]
    preferred_time: Optional[str]
    note: Optional[str]
    source: str
    status: str
    client_id: Optional[int]
    created_at: datetime


class LeadUpdate(BaseModel):
    status: Optional[str] = None  # جديد/تم التواصل/محوّل/مغلق
    note: Optional[str] = None


class PublicPackageOut(BaseModel):
    """Public-safe view of a package for the marketing site (no studio internals)."""
    model_config = _config()
    id: int
    name_ar: str
    sessions: int
    duration_months: int
    price: float
    unlimited: bool


# -------- Note --------
class NoteCreate(BaseModel):
    body: str


class NoteOut(BaseModel):
    model_config = _config()
    id: int
    body: str
    created_at: datetime
    author_name: Optional[str] = None


# -------- Invoice (ZATCA) --------
class InvoiceItem(BaseModel):
    name: str
    quantity: float = 1
    unit_price: float


class InvoiceCreate(BaseModel):
    client_id: Optional[int] = None
    description: Optional[str] = None
    invoice_type: str = "simplified"  # simplified for B2C, standard for B2B
    items: list[InvoiceItem]


class InvoiceOut(BaseModel):
    model_config = _config()
    id: int
    invoice_number: str
    invoice_type: str
    issue_date: datetime
    description: Optional[str]
    subtotal: float
    vat_rate: float
    vat_amount: float
    total: float
    currency: str
    zatca_status: str
    qr_base64: Optional[str]
    invoice_hash: Optional[str]
    client_id: Optional[int]
    client_name: Optional[str] = None


# -------- Reports --------
class DashboardKPIs(BaseModel):
    bookings_today: int
    bookings_today_delta: int
    active_clients: int
    active_clients_delta: int
    monthly_revenue: float
    monthly_revenue_delta: float
    no_show_rate: float
    no_show_delta: float
    last_7_days: list[dict]
    alerts: list[dict]
    top_performers: list[dict]


class ReportsOverview(BaseModel):
    total_revenue: float
    completed_sessions: int
    new_clients: int
    trial_conversion: float
    revenue_6_months: list[dict]
    package_distribution: list[dict]
    no_show_weekly: list[dict]
    trainer_performance: list[dict]
    funnel: list[dict]
    peak_heatmap: dict
