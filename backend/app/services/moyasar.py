"""Moyasar payment gateway client (https://docs.moyasar.com).

Per-studio: each Studio stores its OWN Moyasar secret key, so funds go straight
to that studio's Moyasar account. We use the Invoices API to get a hosted payment
page URL (the link staff send to the client), then always re-fetch the invoice by
id to confirm status (never trust the webhook/redirect payload).

Auth: HTTP Basic with the secret key as the username and an empty password.
Amounts are in the smallest currency unit (halalas) → SAR * 100.
"""
import base64

import requests

from ..config import settings


def _auth(secret_key: str) -> dict:
    token = base64.b64encode(f"{secret_key}:".encode()).decode()
    return {"Authorization": f"Basic {token}", "Content-Type": "application/json"}


def create_invoice(*, secret_key, amount, currency, description, callback_url, metadata=None):
    body = {
        "amount": int(round(float(amount) * 100)),  # halalas
        "currency": currency,
        "description": description,
        "callback_url": callback_url,
    }
    if metadata:
        body["metadata"] = metadata
    r = requests.post(f"{settings.moyasar_base_url}/invoices", json=body, headers=_auth(secret_key), timeout=30)
    if r.status_code >= 400:
        raise RuntimeError(f"Moyasar error {r.status_code}: {r.text}")
    return r.json()  # { id, url, status, ... }


def get_invoice(*, secret_key, invoice_id):
    r = requests.get(f"{settings.moyasar_base_url}/invoices/{invoice_id}", headers=_auth(secret_key), timeout=30)
    if r.status_code >= 400:
        raise RuntimeError(f"Moyasar error {r.status_code}: {r.text}")
    return r.json()
