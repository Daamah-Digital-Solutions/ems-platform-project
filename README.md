# EMS ElRiyadh — Studio Management Platform

A management platform for EMS (Electrical Muscle Stimulation) fitness studios, with an
Arabic (RTL) admin dashboard and a FastAPI backend. It covers clients, bookings,
trainers, packages & subscriptions, resources (machines/suits), reports, and
ZATCA Phase 2 e-invoicing. A public intake endpoint lets a marketing website submit
booking requests (leads) directly into the system.

## Tech stack
- **Frontend:** React 18 + Vite + Tailwind CSS + React Router + Recharts
- **Backend:** FastAPI + SQLAlchemy 2.0 (SQLite for local dev, PostgreSQL in production)
- **Auth:** JWT (Bearer)

## Project structure
```
.
├── src/                 # React frontend (the CRM dashboard)
├── backend/             # FastAPI backend (REST API)
│   └── app/
│       ├── routers/     # API endpoints
│       ├── models.py    # SQLAlchemy models
│       └── ...
├── netlify.toml         # Frontend hosting config
├── backend/Dockerfile   # Backend container (Koyeb/Render/Fly/Railway)
└── DEPLOY.md            # Step-by-step deployment guide
```

## Local development

**Backend** (http://127.0.0.1:8001):
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
First run creates the SQLite database and seeds demo data.
Demo login: `demo@move.sa` / `demo123`.

**Frontend** (http://localhost:5188):
```bash
npm install
npm run dev
```
The Vite dev server proxies `/api` to the backend on port 8001 (see `vite.config.js`).

## Deployment
See [DEPLOY.md](DEPLOY.md) for a free, no-credit-card setup
(Netlify + Koyeb + Neon Postgres).

## API
See [backend/README.md](backend/README.md) for the endpoint reference.
