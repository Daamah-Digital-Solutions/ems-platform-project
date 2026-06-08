# Backend — FastAPI

FastAPI + SQLAlchemy 2.0. Multi-tenant by `studio_id`. JWT auth. ZATCA Phase 2 e-invoicing.
SQLite for local development, PostgreSQL in production.

## Run locally
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
On first run the database is created and seeded with demo data:
- Studio: **Fast Move Riyadh**
- Login: `demo@move.sa` / `demo123`
- 20 clients, 8 trainers, machines, suits, packages, and bookings.

Interactive API docs (Swagger): `http://127.0.0.1:8001/docs`

## Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register` — register a new studio (with default resources)
- `GET /api/auth/me`

### Studio
- `GET /api/studio`, `PATCH /api/studio`

### Clients
- `GET /api/clients?q=&status=&tag=`, `POST /api/clients`
- `GET/PATCH/DELETE /api/clients/{id}`
- `GET/POST /api/clients/{id}/notes`
- `GET /api/clients/{id}/subscriptions`, `GET /api/clients/{id}/bookings`

### Trainers / Machines / Suits
- `GET/POST /api/trainers`, `PATCH /api/trainers/{id}`
- `GET/POST /api/machines`, `PATCH /api/machines/{id}`
- `GET/POST /api/suits?size=`, `PATCH /api/suits/{id}`

### Packages & Subscriptions
- `GET/POST /api/packages`, `PATCH /api/packages/{id}`
- `GET/POST /api/subscriptions`, `POST /api/subscriptions/{id}/freeze`

### Bookings
- `GET /api/bookings?date=` or `?start=&end=` — schedule
- `GET /api/bookings/availability?date=` — open slots + prayer windows
- `POST /api/bookings` — validates conflicts, prayer time, PAR-Q, remaining sessions
- `PATCH /api/bookings/{id}` — status update (decrements a session on completion)
- `DELETE /api/bookings/{id}` — cancel

### Reports
- `GET /api/reports/dashboard` — KPIs + alerts + top performers
- `GET /api/reports/overview?range=30d` — revenue, funnel, heatmap, deltas, etc.

### Public (marketing website — protected by the `X-API-Key` header)
- `GET /api/public/packages` — packages & prices
- `POST /api/public/leads` — receive a booking/contact request (creates a Lead)

### Leads (CRM, JWT)
- `GET /api/leads?status=`, `GET /api/leads/{id}`, `PATCH /api/leads/{id}`
- `POST /api/leads/{id}/convert` — convert a lead into a client

### ZATCA Phase 2
- `GET/POST /api/invoices`, `GET /api/invoices/{id}`, `GET /api/invoices/{id}/xml`

## Configuration
Environment variables (see `.env.example`): `DATABASE_URL`, `SECRET_KEY`,
`ACCESS_TOKEN_EXPIRE_MINUTES`, `CORS_ORIGINS`, `ENV`, `ZATCA_SANDBOX`,
`PUBLIC_API_KEY`, `PUBLIC_STUDIO_ID`.

## Production notes
- Set a strong random `SECRET_KEY`.
- Use PostgreSQL via `DATABASE_URL` (the `postgres://` scheme is normalized automatically).
- Restrict `CORS_ORIGINS` to your real frontend origin(s).
- Serve over HTTPS.
