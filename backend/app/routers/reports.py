from datetime import datetime, timedelta, date as _date

from fastapi import APIRouter, Query
from sqlalchemy import select, func

from .. import models
from ..deps import DB, StudioId


router = APIRouter(prefix="/api/reports", tags=["reports"])


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

    # Monthly revenue
    monthly_revenue = db.scalar(
        select(func.coalesce(func.sum(models.Subscription.price_paid), 0)).where(
            models.Subscription.studio_id == studio_id,
            models.Subscription.created_at >= month_start,
        )
    ) or 0
    prev_month_revenue = db.scalar(
        select(func.coalesce(func.sum(models.Subscription.price_paid), 0)).where(
            models.Subscription.studio_id == studio_id,
            models.Subscription.created_at >= prev_month_start,
            models.Subscription.created_at < month_start,
        )
    ) or 0
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

    # Top performers (this month)
    top = db.execute(
        select(models.Trainer.id, models.Trainer.name_ar, models.Trainer.initials, models.Trainer.month_sessions)
        .where(models.Trainer.studio_id == studio_id, models.Trainer.is_active == True)
        .order_by(models.Trainer.month_sessions.desc())
        .limit(3)
    ).all()
    top_performers = [{"name": t[1], "initials": t[2] or "", "sessions": t[3] or 0} for t in top]

    return {
        "bookings_today": bookings_today,
        "bookings_today_delta": bookings_today - bookings_yesterday,
        "active_clients": active_clients,
        "active_clients_delta": clients_this_month,
        "monthly_revenue": float(monthly_revenue),
        "monthly_revenue_delta": rev_delta,
        "no_show_rate": no_show_rate,
        "no_show_delta": -2,  # static for now
        "last_7_days": last_7,
        "alerts": alerts,
        "top_performers": top_performers,
    }


@router.get("/overview")
def overview(db: DB, studio_id: StudioId, period: str = Query("30d", alias="range")):
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)
    now = datetime.utcnow()
    start = now - timedelta(days=days)

    total_revenue = db.scalar(
        select(func.coalesce(func.sum(models.Subscription.price_paid), 0)).where(
            models.Subscription.studio_id == studio_id,
            models.Subscription.created_at >= start,
        )
    ) or 0

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
    prev_revenue = db.scalar(
        select(func.coalesce(func.sum(models.Subscription.price_paid), 0)).where(
            models.Subscription.studio_id == studio_id,
            models.Subscription.created_at >= prev_start,
            models.Subscription.created_at < start,
        )
    ) or 0
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
        v = db.scalar(
            select(func.coalesce(func.sum(models.Subscription.price_paid), 0)).where(
                models.Subscription.studio_id == studio_id,
                models.Subscription.created_at >= ms,
                models.Subscription.created_at < me,
            )
        ) or 0
        revenue_6.append({"month": months_ar[ms.month - 1], "value": float(v)})

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

    # Trainer performance
    perf_rows = db.execute(
        select(models.Trainer.name_ar, models.Trainer.month_sessions)
        .where(models.Trainer.studio_id == studio_id, models.Trainer.is_active == True)
        .order_by(models.Trainer.month_sessions.desc())
        .limit(5)
    ).all()
    trainer_performance = [{"name": r[0], "sessions": r[1] or 0} for r in perf_rows]

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
