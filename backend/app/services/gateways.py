"""Payment-gateway registry.

Each studio picks one active gateway (studio.payment_gateway) and stores that
gateway's credentials in studio.payment_config[gateway]. Adding a new gateway =
add an entry to CATALOG (+ a service module for its API) — no DB migration.

`secret` fields are write-only: never returned to the client, and a blank value
on save never overwrites a stored secret.
"""

CATALOG = {
    "moyasar": {
        "label": "ميسر (Moyasar)",
        "ready": True,
        "fields": [
            {"key": "publishable_key", "label": "مفتاح النشر (Publishable Key)", "secret": False, "placeholder": "pk_test_..."},
            {"key": "secret_key", "label": "المفتاح السري (Secret Key)", "secret": True, "placeholder": "sk_test_..."},
        ],
    },
    "alrajhi": {
        "label": "بنك الراجحي",
        "ready": False,  # awaiting integration guide + test credentials
        "note": "قيد التجهيز — بانتظار دليل التكامل وبيانات الاختبار من الراجحي. تقدر تحفظ البيانات الآن لتكون جاهزة.",
        "fields": [
            {"key": "merchant_id", "label": "Merchant ID", "secret": False, "placeholder": ""},
            {"key": "terminal_id", "label": "Terminal ID", "secret": False, "placeholder": ""},
            {"key": "api_password", "label": "API Password / Secret", "secret": True, "placeholder": ""},
            {"key": "base_url", "label": "Gateway Base URL", "secret": False, "placeholder": "https://..."},
        ],
    },
    "tap": {
        "label": "Tap (احتياطي)",
        "ready": True,
        "global": True,  # uses a server-wide key; no per-studio credentials
        "fields": [],
    },
}

# Set of secret field keys across all gateways (for masking / blank-skip).
SECRET_FIELDS = {f["key"] for g in CATALOG.values() for f in g["fields"] if f.get("secret")}


def public_catalog() -> dict:
    """Catalog for the Settings UI — field definitions only, no secret values."""
    return CATALOG


def studio_creds(studio, gateway: str) -> dict:
    """Resolve a studio's credentials for a gateway (config first, legacy fallback)."""
    cfg = dict((studio.payment_config or {}).get(gateway) or {})
    if gateway == "moyasar":
        cfg.setdefault("secret_key", studio.moyasar_secret_key)
        cfg.setdefault("publishable_key", studio.moyasar_publishable_key)
        # setdefault keeps a real config value but fills None → coalesce empties
        if not cfg.get("secret_key"):
            cfg["secret_key"] = studio.moyasar_secret_key
        if not cfg.get("publishable_key"):
            cfg["publishable_key"] = studio.moyasar_publishable_key
    return cfg
