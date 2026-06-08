# Deployment Guide

Free stack (no credit card required):

| Layer | Service | Notes |
|-------|---------|-------|
| Frontend (React/Vite) | **Netlify** | Connect the GitHub repo; `netlify.toml` handles build + SPA routing |
| Backend (FastAPI) | **Koyeb** | Free service, deploys the `backend/Dockerfile`, no card required |
| Database | **Neon** | Free, persistent serverless Postgres |

> Koyeb's free instance scales to zero when idle, so the first request after inactivity takes a few seconds to wake.

---

## 0. Push to GitHub
```bash
git remote add origin https://github.com/<ORG>/<REPO>.git
git push -u origin main
```

## 1. Database — Neon
1. Sign in at https://neon.tech with GitHub.
2. **Create Project** (pick the closest region).
3. Copy the **connection string**:
   ```
   postgresql://user:pass@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## 2. Backend — Koyeb
1. Sign in at https://app.koyeb.com with GitHub (no credit card).
2. **Create Web Service → GitHub** → select the repository.
3. Build settings:
   - **Builder:** Dockerfile
   - **Work directory:** `backend`  (so the Docker build context resolves correctly)
   - **Port:** `8000`
   - **Health check path:** `/health`
4. Environment variables:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Neon connection string |
   | `SECRET_KEY` | a long random string |
   | `PUBLIC_API_KEY` | a random string (used by the marketing site) |
   | `PUBLIC_STUDIO_ID` | `1` |
   | `ENV` | `production` |
   | `ZATCA_SANDBOX` | `true` |
   | `CORS_ORIGINS` | `https://<your-site>.netlify.app` (set after step 3) |
5. **Deploy**, then open `https://<service>.koyeb.app/health` → expect `{"ok":true}`.

> On first boot the schema is created automatically and demo data is seeded
> (studio "Fast Move Riyadh", login `demo@move.sa` / `demo123`).

## 3. Frontend — Netlify
1. Sign in at https://app.netlify.com with GitHub.
2. **Add new site → Import an existing project → GitHub** → select the repository
   (Netlify reads `netlify.toml`: build `npm run build`, publish `dist`, SPA redirect).
3. **Environment variables** → add:
   - `VITE_API_BASE` = the Koyeb backend URL (e.g. `https://<service>.koyeb.app`)
4. **Deploy site** → you get a URL like `https://<your-site>.netlify.app`.

> `VITE_API_BASE` is injected at build time — after changing it, trigger a redeploy.

## 4. Connect the two (CORS)
- In Koyeb, set `CORS_ORIGINS` to the Netlify URL and redeploy:
  ```
  https://<your-site>.netlify.app
  ```
- Open the Netlify URL and sign in with `demo@move.sa` / `demo123`.

## 5. Custom domain
- In Netlify → **Domain management → Add a domain** → `crm.emselriyadh.com`.
- Add the DNS record Netlify shows (a CNAME for `crm`).
- Update `CORS_ORIGINS` in Koyeb to include the domain:
  ```
  https://<your-site>.netlify.app,https://crm.emselriyadh.com
  ```

---

## Environment variables reference

**Backend (Koyeb):** `DATABASE_URL`, `SECRET_KEY`, `PUBLIC_API_KEY`, `PUBLIC_STUDIO_ID`, `ENV`, `ZATCA_SANDBOX`, `CORS_ORIGINS`
**Frontend (Netlify):** `VITE_API_BASE`

## Troubleshooting
- **CORS error / no data** — make sure `CORS_ORIGINS` (Koyeb) contains the exact Netlify origin (https, no trailing slash) and `VITE_API_BASE` (Netlify) points to the backend; redeploy after changes.
- **First request slow** — the free instance is waking from idle (normal).
- **Database error** — confirm the Neon URL includes `?sslmode=require`.

## Public booking intake (for the marketing site)
The marketing website submits leads to the backend:
```
POST https://<backend>/api/public/leads
Header: X-API-Key: <PUBLIC_API_KEY>
Body:   { name, phone, area, package_id, preferred_time, note }
```
