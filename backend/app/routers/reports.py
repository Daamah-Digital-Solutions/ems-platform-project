from datetime import datetime, timedelta, date as _date

from fastapi import APIRouter, Query
from sqlalchemy import select, func

from .. import models
from ..deps import DB, StudioId


router = APIRouter(prefix="/api/reports", tags=["reports"])


def _revenue(db, studio_id, start_dt, end_dt=None) -> float:
    """Total revenue in a window = subscriptions (created_at) + manual payments (paid_at)."""
    sub_q = select(func.coalesce(func.sum(models.Subscription.price_paid), 0)).where(
        models.Subscription.studio_id == studio_id,
        models.Subscription.created_at >= start_dt,
    )
    man_q = select(func.coalesce(func.sum(models.ManualPayment.amount), 0)).where(
        models.ManualPayment.studio_id == studio_id,
        models.ManualPayment.paid_at >= start_dt.date(),
    )
    if end_dt is not None:
        sub_q = sub_q.where(models.Subscription.created_at < end_dt)
        man_q = man_q.where(models.ManualPayment.paid_at < end_dt.date())
    return float(db.scalar(sub_q) or 0) + float(db.scalar(man_q) or 0)


def _completed_by_trainer(db, studio_id, start_dt, end_dt=None) -> dict:
    """Completed ("مكتمل") sessions per trainer in a window.

    Returns {trainer_id: {"total": n, "subscription": n}}. Trial count = total - subscription
    (a booking with a subscription_id is a paid-package session; without one it's a trial/one-off).
    """
    q = select(
        models.Booking.trainer_id,
        func.count(models.Booking.id),
        func.count(models.Booking.subscription_id),  # counts non-NULL subscription_id
    ).where(
        models.Booking.studio_id == studio_id,
        models.Booking.status == "مكتمل",
        models.Booking.start_time >= start_dt,
    )
    if end_dt is not None:
        q = q.where(models.Booking.start_time < end_dt)
    q = q.group_by(models.Booking.trainer_id)
    return {r[0]: {"total": int(r[1] or 0), "subscription": int(r[2] or 0)} for r in db.execute(q).all()}


def _month_bounds(month: str | None):
    """Return (start, end, 'YYYY-MM') for a 'YYYY-MM' string, defaulting to the current month."""
    now = datetime.utcnow()
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if month:
        try:
            y, m = month.split("-")
            start = datetime(int(y), int(m), 1)
        except (ValueError, TypeError):
            pass
    end = (start + timedelta(days=32)).replace(day=1)
    return start, end, start.strftime("%Y-%m")


@router.get("/dashboard")
def dashboard(db: DB, studio_id: StudioId):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday = today - timedelta(days=1)
    seven_days_ago = today - timedelta(days=7)
    month_start = today.replace(day=1)
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)

    # Bookings today
    bookings_today = db.scalar(
        select(func.count(models.Booking.id)).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= today,
            models.Booking.start_time < today + timedelta(days=1),
        )
    ) or 0
    bookings_yesterday = db.scalar(
        select(func.count(models.Booking.id)).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= yesterday,
            models.Booking.start_time < today,
        )
    ) or 0

    # Active clients
    active_clients = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id, models.Client.status == "نشط"
        )
    ) or 0

    # Clients added this month
    clients_this_month = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id,
            models.Client.created_at >= month_start,
        )
    ) or 0

    # Monthly revenue = subscriptions + manual payments
    monthly_revenue = _revenue(db, studio_id, month_start)
    prev_month_revenue = _revenue(db, studio_id, prev_month_start, month_start)
    rev_delta = 0
    if prev_month_revenue:
        rev_delta = round(((monthly_revenue - prev_month_revenue) / prev_month_revenue) * 100, 1)

    # No-show rate (last 30 days)
    last_30 = today - timedelta(days=30)
    total_30 = db.scalar(
        select(func.count(models.Booking.id)).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= last_30,
            models.Booking.status.in_(["مكتمل", "لم يحضر"]),
        )
    ) or 0
    noshow_30 = db.scalar(
        select(func.count(models.Booking.id)).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= last_30,
            models.Booking.status == "لم يحضر",
        )
    ) or 0
    no_show_rate = round((noshow_30 / total_30) * 100, 1) if total_30 else 0
    # Previous 30 days (for a real delta)
    prev_30_start = today - timedelta(days=60)
    prev_total_30 = db.scalar(
        select(func.count(models.Booking.id)).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= prev_30_start,
            models.Booking.start_time < last_30,
            models.Booking.status.in_(["مكتمل", "لم يحضر"]),
        )
    ) or 0
    prev_noshow_30 = db.scalar(
        select(func.count(models.Booking.id)).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= prev_30_start,
            models.Booking.start_time < last_30,
            models.Booking.status == "لم يحضر",
        )
    ) or 0
    prev_no_show_rate = round((prev_noshow_30 / prev_total_30) * 100, 1) if prev_total_30 else 0
    no_show_delta = round(no_show_rate - prev_no_show_rate, 1)

    # Last 7 days bookings
    last_7 = []
    days_ar = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        cnt = db.scalar(
            select(func.count(models.Booking.id)).where(
                models.Booking.studio_id == studio_id,
                models.Booking.start_time >= d,
                models.Booking.start_time < d + timedelta(days=1),
            )
        ) or 0
        last_7.append({"day": days_ar[(d.weekday() + 2) % 7], "value": cnt})

    # Alerts: expiring subs, suit washes, parq expired
    alerts = []
    expiring_subs = db.scalar(
        select(func.count(models.Subscription.id)).where(
            models.Subscription.studio_id == studio_id,
            models.Subscription.status == "نشطة",
            models.Subscription.sessions_remaining <= 2,
        )
    ) or 0
    if expiring_subs:
        alerts.append({
            "id": 1, "icon": "⚠️", "tone": "warning",
            "text": f"{expiring_subs} عملاء لم يجددوا باقاتهم", "cta": "عرض"
        })
    high_wash_suits = db.scalar(
        select(func.count(models.Suit.id)).where(
            models.Suit.studio_id == studio_id, models.Suit.washes >= 50
        )
    ) or 0
    if high_wash_suits:
        alerts.append({
            "id": 2, "icon": "🔄", "tone": "info",
            "text": f"{high_wash_suits} بدلات تحتاج صيانة (٥٠+ غسلة)", "cta": "إدارة"
        })

    # Top performers (this month) — real completed sessions from bookings
    month_counts = _completed_by_trainer(db, studio_id, month_start)
    trs = db.execute(
        select(models.Trainer.id, models.Trainer.name_ar, models.Trainer.initials)
        .where(models.Trainer.studio_id == studio_id, models.Trainer.is_active == True)
    ).all()
    top_performers = sorted(
        [{"name": t[1], "initials": t[2] or "", "sessions": month_counts.get(t[0], {}).get("total", 0)} for t in trs],
        key=lambda x: x["sessions"], reverse=True,
    )[:3]

    return {
        "bookings_today": bookings_today,
        "bookings_today_delta": bookings_today - bookings_yesterday,
        "active_clients": active_clients,
        "active_clients_delta": clients_this_month,
        "monthly_revenue": float(monthly_revenue),
        "monthly_revenue_delta": rev_delta,
        "no_show_rate": no_show_rate,
        "no_show_delta": no_show_delta,
        "last_7_days": last_7,
        "alerts": alerts,
        "top_performers": top_performers,
    }


@router.get("/overview")
def overview(db: DB, studio_id: StudioId, period: str = Query("30d", alias="range")):
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)
    now = datetime.utcnow()
    start = now - timedelta(days=days)

    total_revenue = _revenue(db, studio_id, start)

    completed = db.scalar(
        select(func.count(models.Booking.id)).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= start,
            models.Booking.status == "مكتمل",
        )
    ) or 0

    new_clients = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id,
            models.Client.created_at >= start,
        )
    ) or 0

    # Trial conversion
    trial_total = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id,
            models.Client.created_at >= start,
        )
    ) or 1
    converted = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id,
            models.Client.created_at >= start,
            models.Client.status == "نشط",
        )
    ) or 0
    conv_rate = round((converted / trial_total) * 100, 1) if trial_total else 0

    # ---- Previous period (for real deltas) ----
    prev_start = start - timedelta(days=days)
    prev_revenue = _revenue(db, studio_id, prev_start, start)
    prev_completed = db.scalar(
        select(func.count(models.Booking.id)).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= prev_start,
            models.Booking.start_time < start,
            models.Booking.status == "مكتمل",
        )
    ) or 0
    prev_new_clients = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id,
            models.Client.created_at >= prev_start,
            models.Client.created_at < start,
        )
    ) or 0
    prev_converted = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id,
            models.Client.created_at >= prev_start,
            models.Client.created_at < start,
            models.Client.status == "نشط",
        )
    ) or 0
    prev_conv_rate = round((prev_converted / prev_new_clients) * 100, 1) if prev_new_clients else 0

    def _pct(cur, prev):
        if prev:
            return round(((cur - prev) / prev) * 100, 1)
        return 100.0 if cur else 0.0

    total_revenue_delta = _pct(float(total_revenue), float(prev_revenue))
    completed_sessions_delta = _pct(completed, prev_completed)
    new_clients_delta = new_clients - prev_new_clients
    trial_conversion_delta = round(conv_rate - prev_conv_rate, 1)

    # Revenue 6 months
    months_ar = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس",
                 "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    revenue_6 = []
    for i in range(5, -1, -1):
        ms = (now.replace(day=1) - timedelta(days=30 * i)).replace(day=1)
        me = (ms + timedelta(days=32)).replace(day=1)
        v = _revenue(db, studio_id, ms, me)
        revenue_6.append({"month": months_ar[ms.month - 1], "value": v})

    # Package distribution
    pkgs = db.execute(
        select(models.Package.name_ar, func.count(models.Subscription.id))
        .join(models.Subscription, models.Subscription.package_id == models.Package.id)
        .where(models.Package.studio_id == studio_id, models.Subscription.status == "نشطة")
        .group_by(models.Package.id)
    ).all()
    total_subs = sum(p[1] for p in pkgs) or 1
    palette = ["#0D4F4E", "#1A6E6D", "#FF6B6B", "#F59E0B", "#6366F1"]
    package_distribution = [
        {"name": p[0], "value": round((p[1] / total_subs) * 100), "color": palette[i % 5]}
        for i, p in enumerate(pkgs)
    ]

    # Weekly no-show (last 8 weeks)
    no_show_weekly = []
    for i in range(8, 0, -1):
        ws = now - timedelta(days=i * 7)
        we = ws + timedelta(days=7)
        total = db.scalar(
            select(func.count(models.Booking.id)).where(
                models.Booking.studio_id == studio_id,
                models.Booking.start_time >= ws,
                models.Booking.start_time < we,
                models.Booking.status.in_(["مكتمل", "لم يحضر"]),
            )
        ) or 0
        ns = db.scalar(
            select(func.count(models.Booking.id)).where(
                models.Booking.studio_id == studio_id,
                models.Booking.start_time >= ws,
                models.Booking.start_time < we,
                models.Booking.status == "لم يحضر",
            )
        ) or 0
        rate = round((ns / total) * 100) if total else 0
        no_show_weekly.append({"week": f"أ{9 - i}", "value": rate})

    # Trainer performance — real completed sessions in the selected period
    period_counts = _completed_by_trainer(db, studio_id, start)
    perf_rows = db.execute(
        select(models.Trainer.id, models.Trainer.name_ar)
        .where(models.Trainer.studio_id == studio_id, models.Trainer.is_active == True)
    ).all()
    trainer_performance = sorted(
        [{"name": r[1], "sessions": period_counts.get(r[0], {}).get("total", 0)} for r in perf_rows],
        key=lambda x: x["sessions"], reverse=True,
    )[:5]

    # Funnel (static-ish based on counts)
    leads = (db.scalar(select(func.count(models.Client.id)).where(models.Client.studio_id == studio_id)) or 0) * 3
    trials = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id, models.Client.status.in_(["تجريبي", "نشط"])
        )
    ) or 0
    paid = db.scalar(
        select(func.count(models.Client.id)).where(
            models.Client.studio_id == studio_id, models.Client.status == "نشط"
        )
    ) or 0
    retained = int(paid * 0.77)
    funnel = [
        {"stage": "العملاء المحتملين", "value": leads or 150},
        {"stage": "جلسات تجريبية", "value": trials or 78},
        {"stage": "عملاء مدفوعين", "value": paid or 53},
        {"stage": "محتفظ بهم ٦+ شهور", "value": retained or 41},
    ]

    # Peak heatmap (compute from bookings)
    HOURS = list(range(6, 24))
    DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
    grid = [[0] * len(HOURS) for _ in DAYS]
    bks = db.scalars(
        select(models.Booking).where(
            models.Booking.studio_id == studio_id,
            models.Booking.start_time >= start,
        )
    ).all()
    for b in bks:
        d_idx = (b.start_time.weekday() + 2) % 7
        h_idx = b.start_time.hour - 6
        if 0 <= h_idx < len(HOURS):
            grid[d_idx][h_idx] += 1
    # Normalize to 0..5
    max_v = max((max(row) for row in grid), default=1) or 1
    grid_norm = [[min(5, round((v / max_v) * 5)) for v in row] for row in grid]
    peak_heatmap = {"hours": HOURS, "days": DAYS, "grid": grid_norm}

    return {
        "total_revenue": float(total_revenue),
        "total_revenue_delta": total_revenue_delta,
        "completed_sessions": completed,
        "completed_sessions_delta": completed_sessions_delta,
        "new_clients": new_clients,
        "new_clients_delta": new_clients_delta,
        "trial_conversion": conv_rate,
        "trial_conversion_delta": trial_conversion_delta,
        "revenue_6_months": revenue_6,
        "package_distribution": package_distribution,
        "no_show_weekly": no_show_weekly,
        "trainer_performance": trainer_performance,
        "funnel": funnel,
        "peak_heatmap": peak_heatmap,
    }


@router.get("/trainer-sessions")
def trainer_sessions(db: DB, studio_id: StudioId, month: str | None = Query(None, description="YYYY-MM")):
    """Completed sessions per trainer for a given month (default: current month).

    Each trainer's total = completed bookings assigned to them that month, split into
    subscription sessions and trial sessions. Powers the monthly per-trainer report.
    """
    start, end, label = _month_bounds(month)
    counts = _completed_by_trainer(db, studio_id, start, end)

    trainers = db.scalars(
        select(models.Trainer)
        .where(models.Trainer.studio_id == studio_id, models.Trainer.is_active == True)
    ).all()
    active_ids = {t.id for t in trainers}

    rows = []
    for t in trainers:
        c = counts.get(t.id, {"total": 0, "subscription": 0})
        total = c["total"]
        sub = c["subscription"]
        rows.append({
            "trainer_id": t.id,
            "name_ar": t.name_ar,
            "initials": t.initials or (t.name_ar or "")[:2],
            "specialty": t.specialty,
            "completed": total,
            "subscription": sub,
            "trial": total - sub,
        })

    # Include sessions logged under trainers that were since deactivated/deleted, so totals reconcile.
    for tid, c in counts.items():
        if tid in active_ids:
            continue
        t = db.get(models.Trainer, tid)
        total = c["total"]
        sub = c["subscription"]
        rows.append({
            "trainer_id": tid,
            "name_ar": (t.name_ar if t else "مدرب سابق"),
            "initials": ((t.initials if t else None) or "؟"),
            "specialty": (t.specialty if t else None),
            "completed": total,
            "subscription": sub,
            "trial": total - sub,
        })

    rows.sort(key=lambda r: r["completed"], reverse=True)
    return {
        "month": label,
        "total": sum(r["completed"] for r in rows),
        "total_subscription": sum(r["subscription"] for r in rows),
        "total_trial": sum(r["trial"] for r in rows),
        "trainers": rows,
    }
