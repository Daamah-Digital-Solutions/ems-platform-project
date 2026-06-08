# MOVE Backend — نظام إدارة ستوديوهات EMS

FastAPI + SQLAlchemy 2.0 + SQLite. Multi-tenant by `studio_id`. JWT auth. ZATCA Phase 2 e-invoicing.

## التشغيل السريع

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

أول مرة تشغل، الـ DB تتعمل تلقائياً (`move.db`) ويتم seed بالبيانات التجريبية:
- ستوديو: **Fast Move Riyadh**
- بريد: `demo@move.sa` / كلمة المرور: `demo123`
- ٢٠ عميل، ٨ مدربين، ٥ أجهزة، ١٥ بدلة، ٤ باقات، ٢٤ حجز اليوم + حجوزات شهر سابق.

## الـ Endpoints

`http://127.0.0.1:8000/docs` — Swagger UI

### Auth
- `POST /api/auth/login` — تسجيل الدخول
- `POST /api/auth/register` — تسجيل ستوديو جديد (مع موارد افتراضية)
- `GET /api/auth/me`

### الستوديو
- `GET /api/studio`
- `PATCH /api/studio`

### العملاء
- `GET /api/clients?q=...&status=نشط&tag=VIP`
- `POST /api/clients`
- `GET /api/clients/{id}`
- `PATCH /api/clients/{id}`
- `DELETE /api/clients/{id}`
- `GET /api/clients/{id}/notes`
- `POST /api/clients/{id}/notes`
- `GET /api/clients/{id}/subscriptions`
- `GET /api/clients/{id}/bookings`

### المدربين / الأجهزة / البدلات
- `GET /api/trainers`، `POST`، `PATCH /api/trainers/{id}`
- `GET /api/machines`، `POST`، `PATCH`
- `GET /api/suits?size=M`، `POST`، `PATCH`

### الباقات والاشتراكات
- `GET /api/packages`، `POST`، `PATCH`
- `GET /api/subscriptions`
- `POST /api/subscriptions`
- `POST /api/subscriptions/{id}/freeze`

### الحجوزات
- `GET /api/bookings?date=2026-05-13` — جدول اليوم
- `GET /api/bookings/availability?date=2026-05-13` — الأوقات المتاحة + الصلاة
- `POST /api/bookings` — حجز جديد (يتحقق من: التعارض، الصلاة، PAR-Q، الجلسات المتبقية)
- `PATCH /api/bookings/{id}` — تحديث الحالة (يخصم جلسة عند `مكتمل`)
- `DELETE /api/bookings/{id}` — إلغاء

### الموقع العام (للموقع التسويقي emselriyadh.com)
محمية بمفتاح ثابت في الهيدر `X-API-Key` (مش JWT). كل الطلبات تُسجّل تحت `PUBLIC_STUDIO_ID`.
- `GET /api/public/packages` — الباقات والأسعار لعرضها على الموقع
- `POST /api/public/leads` — استقبال طلب حجز/تواصل من الموقع (ينشئ Lead بحالة `جديد`، ما يلمسش جدول الحجوزات)

  حقول الـ body: `name`*، `phone`*، `email`، `area`، `package_id` أو `package`، `preferred_time`، `note`، `source`. (* إلزامي)

### إدارة الطلبات (CRM — JWT)
- `GET /api/leads?status=جديد` — قائمة الطلبات الواردة من الموقع
- `GET /api/leads/{id}`
- `PATCH /api/leads/{id}` — تحديث الحالة/الملاحظة (جديد/تم التواصل/محوّل/مغلق)
- `POST /api/leads/{id}/convert` — تحويل الطلب لعميل (Client) مع دمج تلقائي لو التليفون موجود

### التقارير
- `GET /api/reports/dashboard` — KPIs + tendays + alerts + top performers
- `GET /api/reports/overview?range=30d` — تقرير شامل (revenue, funnel, heatmap, etc)

### ZATCA Phase 2
- `GET /api/invoices`
- `POST /api/invoices` — تنشئ XML بصيغة UBL 2.1 + توقع QR TLV + ترسل لـ ZATCA (sandbox)
- `GET /api/invoices/{id}`
- `GET /api/invoices/{id}/xml` — تحميل XML الفاتورة

## معمارية الـ ZATCA Phase 2

في [`app/services/zatca.py`](app/services/zatca.py):

1. **UBL 2.1 XML** — `build_invoice_xml()` يولّد XML متوافق مع معيار ZATCA
2. **Invoice Hash** — `compute_invoice_hash()` SHA-256 على XML canonical
3. **PIH (Previous Invoice Hash)** — chain ربط كل فاتورة بالسابقة
4. **TLV QR** — `build_tlv_qr()` Tags 1-5 (seller, VAT, timestamp, total, vat)
5. **PNG QR** — `qr_to_png_base64()` صورة QR base64
6. **Submission** — `submit_to_zatca_sandbox()` stub — في الإنتاج يطلب CSID من بوابة فاتورة ويطلق POST لـ Clearance API

### للنقل لـ ZATCA حقيقي:
1. سجل الستوديو في بوابة [فاتورة](https://fatoora.zatca.gov.sa)
2. احصل على CSID (Cryptographic Stamp ID)
3. عدّل `submit_to_zatca_sandbox()` ليرسل لـ `https://gw-fatoora.zatca.gov.sa/...`
4. وقّع XML بالشهادة (using `cryptography` library — موجود في requirements)

## البنية

```
backend/
├── app/
│   ├── main.py            # FastAPI + lifespan + CORS + routers
│   ├── config.py          # Pydantic Settings
│   ├── database.py        # SQLAlchemy engine + session
│   ├── deps.py            # FastAPI dependencies (auth, db, tenant)
│   ├── security.py        # bcrypt + JWT
│   ├── models.py          # كل جداول قاعدة البيانات
│   ├── schemas.py         # Pydantic request/response
│   ├── seed.py            # Mock data identical to frontend
│   ├── routers/
│   │   ├── auth.py
│   │   ├── studios.py
│   │   ├── clients.py
│   │   ├── trainers.py
│   │   ├── resources.py   # machines + suits
│   │   ├── packages.py    # packages + subscriptions
│   │   ├── bookings.py    # booking engine
│   │   ├── reports.py
│   │   └── invoices.py    # ZATCA
│   └── services/
│       └── zatca.py
├── requirements.txt
└── .env
```

## للتحويل لـ PostgreSQL

في `.env`:
```
DATABASE_URL=postgresql://user:pass@host:5432/move
```

ثم:
```bash
pip install psycopg2-binary alembic
alembic init alembic  # ضبط migrations
```

## الأمان للإنتاج

قبل النشر:
- [ ] غيّر `SECRET_KEY` في `.env` بقيمة عشوائية ≥ 64 حرف
- [ ] استخدم HTTPS فقط
- [ ] أضف rate limiting (slowapi)
- [ ] فعّل audit logs (model `AuditLog`)
- [ ] انقل لـ PostgreSQL
- [ ] اضبط CORS origins على نطاقك الحقيقي فقط
