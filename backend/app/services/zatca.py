"""ZATCA Phase 2 (Fatoora) e-invoicing implementation.

Implements:
- UBL 2.1 XML invoice generation
- SHA-256 invoice hash (chained with previous hash)
- TLV-encoded QR code (Tags 1-5)
- Base64 QR PNG
- Digital signature stub (full implementation requires CSID from ZATCA portal)

References:
- ZATCA E-Invoicing Implementation Standards v1.1
- TLV QR Spec: Tag 1=Seller, 2=VAT, 3=Timestamp, 4=Total, 5=VAT amount
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import re
from datetime import datetime, timezone
from typing import Sequence

import qrcode
import xml.etree.ElementTree as etree

# Register namespace prefixes so output looks clean (matching lxml semantics)
etree.register_namespace("", "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2")
etree.register_namespace("cac", "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2")
etree.register_namespace("cbc", "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2")
etree.register_namespace("ext", "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2")

# -------- TLV QR --------

def _tlv(tag: int, value: str) -> bytes:
    """Build a single TLV (Tag-Length-Value) block."""
    val = value.encode("utf-8")
    return bytes([tag, len(val)]) + val


def build_tlv_qr(
    seller_name: str,
    vat_number: str,
    timestamp: datetime,
    total_with_vat: float,
    vat_amount: float,
) -> str:
    """Return base64-encoded TLV string per ZATCA Phase 1 + Phase 2 requirements."""
    ts = timestamp.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    payload = (
        _tlv(1, seller_name or "")
        + _tlv(2, vat_number or "")
        + _tlv(3, ts)
        + _tlv(4, f"{total_with_vat:.2f}")
        + _tlv(5, f"{vat_amount:.2f}")
    )
    return base64.b64encode(payload).decode("ascii")


def qr_to_png_base64(tlv_b64: str) -> str:
    """Render the TLV string as a QR PNG, return base64 data URI."""
    img = qrcode.make(tlv_b64)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


# -------- UBL XML --------

NSMAP = {
    None: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    "cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    "cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    "ext": "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2",
}
CAC = NSMAP["cac"]
CBC = NSMAP["cbc"]


def _qn(ns: str, name: str) -> str:
    return f"{{{ns}}}{name}"


def build_invoice_xml(
    invoice_number: str,
    invoice_type: str,  # "simplified" or "standard"
    issue_date: datetime,
    seller_name: str,
    seller_vat: str,
    seller_cr: str | None,
    seller_address: str | None,
    buyer_name: str | None,
    buyer_vat: str | None,
    items: Sequence[dict],
    subtotal: float,
    vat_rate: float,
    vat_amount: float,
    total: float,
    previous_hash: str = "0",
    currency: str = "SAR",
) -> str:
    """Generate UBL 2.1 XML for a ZATCA invoice. Returns XML string."""

    root = etree.Element("{urn:oasis:names:specification:ubl:schema:xsd:Invoice-2}Invoice")

    def el(parent, ns_name, text=None, **attrs):
        e = etree.SubElement(parent, ns_name)
        if text is not None:
            e.text = str(text)
        for k, v in attrs.items():
            e.set(k, str(v))
        return e

    # Profile and IDs
    el(root, _qn(CBC, "ProfileID"), "reporting:1.0")
    el(root, _qn(CBC, "ID"), invoice_number)
    el(root, _qn(CBC, "UUID"), f"move-{invoice_number}")
    el(root, _qn(CBC, "IssueDate"), issue_date.strftime("%Y-%m-%d"))
    el(root, _qn(CBC, "IssueTime"), issue_date.strftime("%H:%M:%S"))
    # Invoice type code: 388 = standard, 0200000 = simplified
    type_code = "388"
    name_code = "0100000" if invoice_type == "standard" else "0200000"
    el(root, _qn(CBC, "InvoiceTypeCode"), type_code, name=name_code)
    el(root, _qn(CBC, "DocumentCurrencyCode"), currency)
    el(root, _qn(CBC, "TaxCurrencyCode"), currency)

    # Previous invoice hash (PIH)
    add_doc_ref = etree.SubElement(root, _qn(CAC, "AdditionalDocumentReference"))
    el(add_doc_ref, _qn(CBC, "ID"), "PIH")
    attach = etree.SubElement(add_doc_ref, _qn(CAC, "Attachment"))
    embed = etree.SubElement(
        attach, _qn(CBC, "EmbeddedDocumentBinaryObject"), mimeCode="text/plain"
    )
    embed.text = previous_hash

    # Supplier (seller)
    supplier = etree.SubElement(root, _qn(CAC, "AccountingSupplierParty"))
    party = etree.SubElement(supplier, _qn(CAC, "Party"))
    if seller_cr:
        pid = etree.SubElement(party, _qn(CAC, "PartyIdentification"))
        el(pid, _qn(CBC, "ID"), seller_cr, schemeID="CRN")
    if seller_address:
        addr = etree.SubElement(party, _qn(CAC, "PostalAddress"))
        el(addr, _qn(CBC, "StreetName"), seller_address)
        country = etree.SubElement(addr, _qn(CAC, "Country"))
        el(country, _qn(CBC, "IdentificationCode"), "SA")
    tax_scheme = etree.SubElement(party, _qn(CAC, "PartyTaxScheme"))
    el(tax_scheme, _qn(CBC, "CompanyID"), seller_vat)
    scheme = etree.SubElement(tax_scheme, _qn(CAC, "TaxScheme"))
    el(scheme, _qn(CBC, "ID"), "VAT")
    legal = etree.SubElement(party, _qn(CAC, "PartyLegalEntity"))
    el(legal, _qn(CBC, "RegistrationName"), seller_name)

    # Customer (only required for standard)
    if invoice_type == "standard" and buyer_name:
        cust = etree.SubElement(root, _qn(CAC, "AccountingCustomerParty"))
        cparty = etree.SubElement(cust, _qn(CAC, "Party"))
        if buyer_vat:
            cts = etree.SubElement(cparty, _qn(CAC, "PartyTaxScheme"))
            el(cts, _qn(CBC, "CompanyID"), buyer_vat)
            csch = etree.SubElement(cts, _qn(CAC, "TaxScheme"))
            el(csch, _qn(CBC, "ID"), "VAT")
        clegal = etree.SubElement(cparty, _qn(CAC, "PartyLegalEntity"))
        el(clegal, _qn(CBC, "RegistrationName"), buyer_name)

    # Tax total
    tax_total = etree.SubElement(root, _qn(CAC, "TaxTotal"))
    el(tax_total, _qn(CBC, "TaxAmount"), f"{vat_amount:.2f}", currencyID=currency)
    tax_subtotal = etree.SubElement(tax_total, _qn(CAC, "TaxSubtotal"))
    el(tax_subtotal, _qn(CBC, "TaxableAmount"), f"{subtotal:.2f}", currencyID=currency)
    el(tax_subtotal, _qn(CBC, "TaxAmount"), f"{vat_amount:.2f}", currencyID=currency)
    tcat = etree.SubElement(tax_subtotal, _qn(CAC, "TaxCategory"))
    el(tcat, _qn(CBC, "ID"), "S")
    el(tcat, _qn(CBC, "Percent"), f"{vat_rate:.2f}")
    tsch = etree.SubElement(tcat, _qn(CAC, "TaxScheme"))
    el(tsch, _qn(CBC, "ID"), "VAT")

    # Legal monetary total
    legal_total = etree.SubElement(root, _qn(CAC, "LegalMonetaryTotal"))
    el(legal_total, _qn(CBC, "LineExtensionAmount"), f"{subtotal:.2f}", currencyID=currency)
    el(legal_total, _qn(CBC, "TaxExclusiveAmount"), f"{subtotal:.2f}", currencyID=currency)
    el(legal_total, _qn(CBC, "TaxInclusiveAmount"), f"{total:.2f}", currencyID=currency)
    el(legal_total, _qn(CBC, "PayableAmount"), f"{total:.2f}", currencyID=currency)

    # Invoice lines
    for idx, item in enumerate(items, start=1):
        line = etree.SubElement(root, _qn(CAC, "InvoiceLine"))
        el(line, _qn(CBC, "ID"), str(idx))
        el(line, _qn(CBC, "InvoicedQuantity"), f"{item['quantity']:.2f}", unitCode="EA")
        line_amount = item["quantity"] * item["unit_price"]
        el(line, _qn(CBC, "LineExtensionAmount"), f"{line_amount:.2f}", currencyID=currency)
        line_tax_total = etree.SubElement(line, _qn(CAC, "TaxTotal"))
        line_vat = line_amount * (vat_rate / 100)
        el(line_tax_total, _qn(CBC, "TaxAmount"), f"{line_vat:.2f}", currencyID=currency)
        el(line_tax_total, _qn(CBC, "RoundingAmount"), f"{(line_amount + line_vat):.2f}", currencyID=currency)
        item_el = etree.SubElement(line, _qn(CAC, "Item"))
        el(item_el, _qn(CBC, "Name"), item["name"])
        # Item classified tax
        ictax = etree.SubElement(item_el, _qn(CAC, "ClassifiedTaxCategory"))
        el(ictax, _qn(CBC, "ID"), "S")
        el(ictax, _qn(CBC, "Percent"), f"{vat_rate:.2f}")
        ictsch = etree.SubElement(ictax, _qn(CAC, "TaxScheme"))
        el(ictsch, _qn(CBC, "ID"), "VAT")
        price = etree.SubElement(line, _qn(CAC, "Price"))
        el(price, _qn(CBC, "PriceAmount"), f"{item['unit_price']:.2f}", currencyID=currency)

    return etree.tostring(root, encoding="utf-8", xml_declaration=True).decode("utf-8")


def compute_invoice_hash(xml: str) -> str:
    """SHA-256 hash of the canonicalized XML."""
    # Canonicalize: remove leading/trailing whitespace, normalize CRLF
    normalized = re.sub(r">\s+<", "><", xml).strip()
    h = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    # ZATCA expects base64 of binary hash
    binary = hashlib.sha256(normalized.encode("utf-8")).digest()
    return base64.b64encode(binary).decode("ascii")


def submit_to_zatca_sandbox(xml: str, invoice_hash: str) -> dict:
    """Stub: in production this calls ZATCA Clearance/Reporting API.

    For demo/sandbox, we return a mock success response.
    Real implementation: POST to https://gw-fatoora.zatca.gov.sa/e-invoicing/...
    with the CSID-signed XML and headers.
    """
    return {
        "status": "cleared",
        "clearance_id": f"ZATCA-MOCK-{invoice_hash[:12]}",
        "submitted_at": datetime.utcnow().isoformat(),
        "warnings": [],
        "notice": "هذه استجابة وهمية. لتفعيل ZATCA الحقيقي يجب التسجيل والحصول على CSID من بوابة فاتورة.",
    }
