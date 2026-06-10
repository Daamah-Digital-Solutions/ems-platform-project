# Deployment Guide (VPS + Docker Compose)

Runs the whole platform on a single VPS with one command. Docker Compose starts:

| Service | What |
|---------|------|
| `web` | Caddy — serves the React frontend and reverse-proxies `/api`, with **automatic HTTPS** |
| `api` | FastAPI backend |
| `db`  | PostgreSQL (persistent volume) |

Everything is served from one domain (`crm.emselriyadh.com`), so there is no CORS setup.

> Docker is recommended but not required. A manual setup (Python + Postgres + Nginx + certbot)
> is possible but involves many more steps; this guide uses Docker Compose.

---

## 1. Point the domain at the VPS
In your DNS provider add an **A record**:
- `crm` → `<VPS_IP>`

(HTTPS won't be issued until DNS resolves to the server.)

## 2. Install Docker on the VPS
SSH in (or use Hostinger's Browser Terminal) and run:
```bash
curl -fsSL https://get.docker.com | sh
```

## 3. Get the code
```bash
git clone https://github.com/Daamah-Digital-Solutions/ems-platform-project.git
cd ems-platform-project
```

## 4. Configure secrets
```bash
cp .env.example .env
nano .env
```
Fill in:
```
SITE_DOMAIN=crm.emselriyadh.com
SITE_URL=https://crm.emselriyadh.com
POSTGRES_PASSWORD=<strong random>
SECRET_KEY=<long random>
PUBLIC_API_KEY=<random>
```

## 5. Launch
```bash
docker compose up -d --build
```
Open `https://crm.emselriyadh.com` — sign in with `demo@move.sa` / `demo123`.

On first boot the database schema is created and demo data is seeded.

---

## Operating it
```bash
docker compose ps              # status
docker compose logs -f api     # backend logs
docker compose logs -f web     # caddy / TLS logs
docker compose pull && docker compose up -d --build   # update after a git pull
docker compose down            # stop (data persists in volumes)
```

## Notes
- Open ports **80** and **443** in the VPS firewall (`ufw allow 80,443/tcp`).
- HTTPS is automatic once DNS points to the server; for a quick HTTP-only test set `SITE_DOMAIN=<VPS_IP>`.
- Database data persists in the `dbdata` Docker volume across restarts/redeploys.

## Public booking intake (for the marketing site)
```
POST https://crm.emselriyadh.com/api/public/leads
Header: X-API-Key: <PUBLIC_API_KEY>
Body:   { name, phone, area, package_id, preferred_time, note }
```
