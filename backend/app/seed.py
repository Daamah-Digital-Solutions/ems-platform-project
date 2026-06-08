"""Seed the database with the same mock data the frontend was using.

Idempotent: only runs if the demo studio doesn't exist yet.
"""
from __future__ import annotations

from datetime import datetime, timedelta, date

from sqlalchemy import select

from .database import SessionLocal
from . import models
from .security import hash_password


DEMO_EMAIL = "demo@move.sa"


WORKING_HOURS = {
    "السبت": {"open": "06:00", "close": "23:00", "closed": False},
    "الأحد": {"open": "06:00", "close": "23:00", "closed": False},
    "الإثنين": {"open": "06:00", "close": "23:00", "closed": False},
    "الثلاثاء": {"open": "06:00", "close": "23:00", "closed": False},
    "الأربعاء": {"open": "06:00", "close": "23:00", "closed": False},
    "الخميس": {"open": "06:00", "close": "23:00", "closed": False},
    "الجمعة": {"open": "14:00", "close": "23:00", "closed": False},
}


TRAINERS = [
    ("كابتن أحمد محمد", "أم", "متخصص EMS", "miha bodytec", "2026/03/15", 4.8, 128, 72, "متاح", "ذكر"),
    ("كابتن عمر السيد", "عس", "متخصص EMS", "Glucker Kolleg", "2025/11/20", 4.9, 145, 81, "في جلسة", "ذكر"),
    ("كابتن سارة العنزي", "سع", "متخصصة نسائي", "EMS Pro", "2026/01/10", 4.9, 132, 78, "متاح", "أنثى"),
    ("كابتن ريم القحطاني", "رق", "متخصصة نسائي", "miha bodytec", "2025/08/05", 4.7, 109, 65, "متاح", "أنثى"),
    ("كابتن خالد الزهراني", "خز", "لياقة + EMS", "XBody", "2026/02/12", 4.6, 94, 60, "إجازة", "ذكر"),
    ("كابتن محمد الشهري", "مش", "متخصص EMS", "miha bodytec", "2025/05/28", 4.5, 86, 58, "متاح", "ذكر"),
    ("كابتن منى الحربي", "مح", "متخصصة نسائي", "EMS Pro", "2026/04/18", 4.8, 102, 69, "في جلسة", "أنثى"),
    ("كابتن فيصل العمري", "فع", "متخصص EMS", "Glucker Kolleg", "2026/07/02", 4.7, 78, 62, "متاح", "ذكر"),
]

MACHINES = [
    ("الجهاز #1", "miha bodytec II", "متاح", 4280, "2024/12/10", "2025/03/10"),
    ("الجهاز #2", "miha bodytec II", "في جلسة", 3950, "2024/11/22", "2025/02/22"),
    ("الجهاز #3", "miha bodytec II", "متاح", 3140, "2024/12/05", "2025/03/05"),
    ("الجهاز #4", "miha bodytec II", "صيانة مجدولة", 5120, "2024/10/15", "2025/01/15"),
    ("الجهاز #5", "XBody Newave", "متاح", 1820, "2024/12/20", "2025/03/20"),
]

SUIT_DATA = [
    ("S", 25, "متاح"),
    ("M", 47, "في الغسيل"),
    ("M", 12, "متاح"),
    ("M", 8, "متاح"),
    ("L", 33, "في جلسة"),
    ("L", 55, "يحتاج استبدال"),
    ("L", 18, "متاح"),
    ("XL", 21, "متاح"),
    ("S", 4, "متاح"),
    ("M", 38, "متاح"),
    ("L", 62, "يحتاج استبدال"),
    ("M", 29, "متاح"),
    ("L", 14, "متاح"),
    ("XL", 9, "متاح"),
    ("M", 41, "في الغسيل"),
]

PACKAGES = [
    ("باقة التجربة", 4, 1, 799, False, "bg-amber-50 text-amber-700"),
    ("الباقة الذهبية", 24, 3, 3900, False, "bg-brand-50 text-brand"),
    ("الباقة البلاتينية", 48, 6, 6900, False, "bg-indigo-50 text-indigo-700"),
    ("باقة VIP", 999, 1, 2500, True, "bg-rose-50 text-rose-700"),
]

# (name_ar, name_en, phone, gender, age, status, tags, package_idx, remaining, total,
#  last_session, suit_size, parq_flags)
CLIENTS_RAW = [
    ("نورة الخالدي", "Noura Al-Khalidi", "+966 50 123 4567", "أنثى", 32, "نشط",
     ["VIP", "منتظم"], 1, 12, 24, "قبل يومين", "M", []),
    ("محمد العتيبي", "Mohammed Al-Otaibi", "+966 55 987 6543", "ذكر", 45, "نشط",
     ["VIP"], 2, 31, 48, "أمس", "L", ["ضغط دم"]),
    ("سارة المطيري", "Sara Al-Mutairi", "+966 56 444 8899", "أنثى", 28, "نشط",
     ["منتظم"], 1, 5, 24, "اليوم", "S", []),
    ("عبدالله السبيعي", "Abdullah Al-Sebai", "+966 53 222 1144", "ذكر", 38, "تجريبي",
     ["جديد"], 0, 3, 4, "قبل ٣ أيام", "L", []),
    ("ريم الدوسري", "Reem Al-Dosari", "+966 50 333 9988", "أنثى", 34, "نشط",
     ["VIP", "منتظم"], 3, 999, 999, "أمس", "M", []),
    ("خالد القحطاني", "Khalid Al-Qahtani", "+966 55 666 1212", "ذكر", 42, "مجمد",
     ["متعثر"], 1, 8, 24, "قبل أسبوعين", "XL", ["سكري"]),
    ("منى الشمري", "Mona Al-Shammari", "+966 56 778 9090", "أنثى", 30, "نشط",
     ["منتظم"], 2, 22, 48, "قبل يومين", "M", []),
    ("فيصل الغامدي", "Faisal Al-Ghamdi", "+966 50 121 3434", "ذكر", 50, "نشط",
     ["VIP"], 2, 12, 48, "اليوم", "L", ["ضغط دم", "القلب"]),
    ("هند الحربي", "Hind Al-Harbi", "+966 55 909 1010", "أنثى", 27, "تجريبي",
     ["جديد"], 0, 2, 4, "أمس", "S", []),
    ("سلطان الزهراني", "Sultan Al-Zahrani", "+966 53 808 7676", "ذكر", 36, "نشط",
     ["منتظم"], 1, 18, 24, "قبل ٣ أيام", "L", []),
    ("الجوهرة العنزي", "Aljawhara Al-Anazi", "+966 56 234 5678", "أنثى", 41, "نشط",
     ["VIP"], 3, 999, 999, "اليوم", "M", []),
    ("تركي الفهد", "Turki Al-Fahad", "+966 55 545 8989", "ذكر", 33, "منتهي",
     ["متعثر"], 1, 0, 24, "قبل شهر", "L", []),
    ("لطيفة الصالح", "Latifa Al-Saleh", "+966 50 191 7474", "أنثى", 39, "نشط",
     ["منتظم"], 1, 14, 24, "أمس", "M", ["حمل سابق"]),
    ("بدر العتيبي", "Bader Al-Otaibi", "+966 53 838 4747", "ذكر", 29, "نشط",
     ["جديد", "منتظم"], 1, 20, 24, "قبل يومين", "M", []),
    ("عائشة البلوي", "Aisha Al-Balwi", "+966 56 161 5252", "أنثى", 35, "نشط",
     ["منتظم"], 2, 28, 48, "اليوم", "M", []),
    ("نواف الرشيد", "Nawaf Al-Rasheed", "+966 55 717 6363", "ذكر", 47, "نشط",
     ["VIP"], 2, 9, 48, "أمس", "XL", []),
    ("شهد البقمي", "Shahad Al-Buqami", "+966 50 525 9292", "أنثى", 26, "تجريبي",
     ["جديد"], 0, 1, 4, "اليوم", "S", []),
    ("عبدالعزيز السهلي", "Abdulaziz Al-Sahli", "+966 53 393 8181", "ذكر", 40, "نشط",
     ["منتظم"], 1, 17, 24, "قبل يومين", "L", []),
    ("العنود الحارثي", "Alanoud Al-Harthi", "+966 56 222 6464", "أنثى", 31, "نشط",
     ["VIP", "منتظم"], 2, 35, 48, "أمس", "M", []),
    ("سعد المالكي", "Saad Al-Maliki", "+966 55 818 3535", "ذكر", 52, "نشط",
     ["VIP"], 3, 999, 999, "اليوم", "XL", ["ضغط دم"]),
]


def ensure_seed():
    """Run seed if demo studio is not present."""
    db = SessionLocal()
    try:
        existing = db.scalar(select(models.User).where(models.User.email == DEMO_EMAIL))
        if existing:
            return  # already seeded

        # Studio
        studio = models.Studio(
            name_ar="Fast Move Riyadh",
            name_en="Fast Move Riyadh",
            city="الرياض",
            branch="حي الملقا",
            phone="+966 11 234 5678",
            email="info@fastmove.sa",
            plan="الباقة الاحترافية",
            studio_type="مختلط",
            branches="2-3",
            vat="300012345600003",
            cr="1010123456",
            logo="FM",
            working_hours=WORKING_HOURS,
            ramadan_mode=True,
            block_prayer=True,
            prayer_buffer_min=10,
        )
        db.add(studio)
        db.flush()

        # Owner user
        owner = models.User(
            studio_id=studio.id,
            name_ar="أحمد العتيبي",
            name_en="Ahmed Al-Otaibi",
            email=DEMO_EMAIL,
            phone="+966 50 111 2222",
            role="owner",
            password_hash=hash_password("demo123"),
            initials="أع",
        )
        db.add(owner)
        db.flush()

        # Trainers
        trainer_ids = []
        for (name, init, spec, cert, expiry, rating, mses, conv, status, gender) in TRAINERS:
            t = models.Trainer(
                studio_id=studio.id,
                name_ar=name, initials=init, specialty=spec,
                certification=cert, cert_expiry=expiry, rating=rating,
                month_sessions=mses, conversion_rate=conv, status=status, gender=gender,
            )
            db.add(t)
            db.flush()
            trainer_ids.append(t.id)

        # Machines
        machine_ids = []
        for (label, model, status, sessions, last_s, next_s) in MACHINES:
            m = models.Machine(
                studio_id=studio.id, label=label, model=model, status=status,
                total_sessions=sessions, last_service=last_s, next_service=next_s,
            )
            db.add(m)
            db.flush()
            machine_ids.append(m.id)

        # Suits
        suit_ids = []
        for i, (size, washes, status) in enumerate(SUIT_DATA, start=1):
            s = models.Suit(
                studio_id=studio.id,
                label=f"البدلة #{i}",
                size=size, washes=washes, status=status,
            )
            db.add(s)
            db.flush()
            suit_ids.append(s.id)

        # Packages
        package_ids = []
        for (name, sessions, dur, price, unlimited, color) in PACKAGES:
            p = models.Package(
                studio_id=studio.id,
                name_ar=name, sessions=sessions, duration_months=dur,
                price=price, unlimited=unlimited, color=color,
            )
            db.add(p)
            db.flush()
            package_ids.append(p.id)

        # Clients + Subscriptions
        client_ids = []
        for i, c in enumerate(CLIENTS_RAW):
            (name, en, phone, gender, age, status, tags, pkg_idx, rem, tot, last, suit_size, parq_flags) = c
            preferred_t = trainer_ids[i % len(trainer_ids)]
            cl = models.Client(
                studio_id=studio.id,
                name_ar=name, name_en=en, phone=phone, gender=gender, age=age,
                status=status, tags=tags, suit_size=suit_size,
                preferred_trainer_id=preferred_t,
                parq_status="ساري" if status != "منتهي" else "منتهي",
                parq_expiry="2025/06/15",
                parq_flags=parq_flags or None,
                last_session=last,
                join_date="2024/08/15",
            )
            db.add(cl)
            db.flush()
            client_ids.append(cl.id)

            # Subscription
            pkg = db.get(models.Package, package_ids[pkg_idx])
            sub_status = {
                "نشط": "نشطة", "تجريبي": "نشطة", "مجمد": "مجمدة", "منتهي": "منتهية"
            }.get(status, "نشطة")
            sub = models.Subscription(
                studio_id=studio.id,
                client_id=cl.id,
                package_id=pkg.id,
                start_date=date.today() - timedelta(days=60),
                end_date=date.today() + timedelta(days=pkg.duration_months * 30 - 60),
                sessions_total=tot,
                sessions_remaining=0 if rem == "∞" else rem,
                price_paid=pkg.price,
                status=sub_status,
            )
            db.add(sub)

        # Today's bookings
        TIMES = [
            (6, 0), (6, 30), (7, 0), (7, 30), (8, 0), (8, 30), (9, 0),
            (10, 0), (10, 30), (11, 0), (11, 30),
            (13, 0), (14, 0), (15, 0), (16, 0), (16, 30), (17, 0),
            (17, 30), (18, 0), (18, 30), (19, 0), (20, 0), (20, 30), (21, 0),
        ]
        STATUSES = ["مكتمل"] * 11 + ["لم يحضر"] + ["مكتمل", "مكتمل", "جاري"] + ["مؤكد"] * 9
        today = datetime.utcnow().replace(second=0, microsecond=0)
        today_morning = today.replace(hour=0, minute=0)
        for i, (h, m) in enumerate(TIMES):
            db.add(models.Booking(
                studio_id=studio.id,
                client_id=client_ids[i % len(client_ids)],
                trainer_id=trainer_ids[i % len(trainer_ids)],
                machine_id=machine_ids[i % len(machine_ids)],
                suit_id=suit_ids[i % len(suit_ids)],
                start_time=today_morning.replace(hour=h, minute=m),
                duration_min=20,
                status=STATUSES[i % len(STATUSES)],
            ))

        # Past bookings (some completed, some no-show — for reports)
        for d_ago in range(1, 30):
            day = today - timedelta(days=d_ago)
            for i in range(5 + (d_ago % 8)):  # 5-12 bookings/day
                hour = 6 + (i + d_ago) % 14
                db.add(models.Booking(
                    studio_id=studio.id,
                    client_id=client_ids[(i + d_ago) % len(client_ids)],
                    trainer_id=trainer_ids[(i + d_ago) % len(trainer_ids)],
                    machine_id=machine_ids[(i + d_ago) % len(machine_ids)],
                    suit_id=suit_ids[(i + d_ago) % len(suit_ids)],
                    start_time=day.replace(hour=hour, minute=0),
                    duration_min=20,
                    status="مكتمل" if (i + d_ago) % 12 != 0 else "لم يحضر",
                ))

        db.commit()
        msg = f"[OK] Seeded studio id={studio.id}, {len(CLIENTS_RAW)} clients, " \
              f"{len(TRAINERS)} trainers, {len(MACHINES)} machines, {len(SUIT_DATA)} suits"
        try:
            print(msg)
        except Exception:
            pass
    finally:
        db.close()
