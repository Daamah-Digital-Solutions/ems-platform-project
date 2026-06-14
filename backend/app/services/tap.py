"""Tap payment gateway client (https://developers.tap.company).

We use the Charges API with a hosted payment page: create a charge with
source = src_all, and Tap returns transaction.url — the link we send to the
customer. Tap then redirects to redirect.url and POSTs to post.url. We always
re-fetch the charge by id to confirm status (never trust the webhook payload).
"""
import re
import requests

from ..config import settings


def _headers():
    return {
        "Authorization": f"Bearer {settings.tap_secret_key}",
        "Content-Type": "application/json",
    }


def _phone_obj(phone: str | None):
    digits = re.sub(r"\D", "", phone or "")
    if digits.startswith("966"):
        digits = digits[3:]
    elif digits.startswith("0"):
        digits = digits[1:]
    if len(digits) >= 9:
        return {"country_code": "966", "number": digits[-9:]}
    return None


def create_charge(*, amount, currency, customer_name, customer_phone, customer_email,
                  description, metadata, redirect_url, post_url):
    body = {
        "amount": round(float(amount), 2),
        "currency": currency,
        "threeDSecure": True,
        "description": description,
        "metadata": metadata,
        "source": {"id": "src_all"},
        "redirect": {"url": redirect_url},
        "post": {"url": post_url},
        "customer": {"first_name": customer_name or "Customer"},
    }
    phone = _phone_obj(customer_phone)
    if phone:
        body["customer"]["phone"] = phone
    if customer_email:
        body["customer"]["email"] = customer_email
    if not phone and not customer_email:
        body["customer"]["email"] = "noreply@emselriyadh.com"

    r = requests.post(f"{settings.tap_base_url}/charges", json=body, headers=_headers(), timeout=30)
    if r.status_code >= 400:
        raise RuntimeError(f"Tap error {r.status_code}: {r.text}")
    return r.json()


def get_charge(charge_id: str):
    r = requests.get(f"{settings.tap_base_url}/charges/{charge_id}", headers=_headers(), timeout=30)
    if r.status_code >= 400:
        raise RuntimeError(f"Tap error {r.status_code}: {r.text}")
    return r.json()
