from datetime import datetime
import json
from decimal import Decimal
from math import ceil
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, Request
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import Session, joinedload, load_only
from app.models.invoices import Invoice
from app.models.payment_history import PaymentHistory, PaymentStatus
from app.models.users import User
from app.models.subscribed_landlord import SubscribedLandlord
from app.modules.subscriptions.services import mark_renewal_paid_and_extend
from app.models.bank_deposit import BankDeposit
from app.models.bank_deposit_item import BankDepositItem

# from app.modules.paymentHistory.schemas import PaymentCreate
# from app.utils.myfatoorah_service import create_invoice
from uuid import UUID
import requests
from app.core.config import settings
from urllib.parse import urlencode
from app.utils.email_service import render_template, send_email

MYFATOORAH_API_URL = settings.MYFATOORAH_API_URL
MYFATOORAH_API_KEY = settings.MYFATOORAH_API_KEY

# ---------- helpers ----------


def _extend_subscription_on_paid(db: Session, payment: PaymentHistory) -> None:
    """
    If this PaymentHistory row is a SUBSCRIPTION and is PAID, auto-extend the
    corresponding SubscribedLandlord contract.

    Idempotent guard:
      - Only extend if subscribed_landlords.payment_link matches this payment.payment_url.
      - After extension, mark_renewal_paid_and_extend() clears payment_link, so repeats are no-ops.
    """
    # Must be a subscription payment
    if (payment.payment_type or "").upper() != "SUBSCRIPTION":
        return
    # Require plan & user linkage
    if not payment.subscription_id or not payment.user_id:
        return
    # Need the landlord_id via users table
    user = (
        db.query(User)
        .filter(User.id == payment.user_id)
        .options(load_only(User.id, User.landlord_id))
        .first()
    )
    if not user or not user.landlord_id:
        return

    # Find the active subscription record for this landlord + plan
    rec = (
        db.query(SubscribedLandlord)
        .filter(
            SubscribedLandlord.landlord_id == user.landlord_id,
            SubscribedLandlord.subscription_id == payment.subscription_id,
            SubscribedLandlord.status == "approved",
        )
        .order_by(SubscribedLandlord.created_at.desc())
        .first()
    )
    if not rec:
        return

    # Idempotency: extend only if this payment link is what the subscription is waiting on
    if not rec.payment_link or (payment.payment_url or "") != rec.payment_link:
        return

    # Extend (uses plan.duration_in_days internally when extend_days=None)
    mark_renewal_paid_and_extend(db, rec.id, extend_days=None)


def _bearer_token() -> str:
    tok = MYFATOORAH_API_KEY.strip()
    if tok.lower().startswith("bearer "):
        tok = tok[7:].strip()
    return f"Bearer {tok}"


def _mf_headers():
    return {
        "Authorization": _bearer_token(),
        "Content-Type": "application/json",
    }


def _mf(path: str) -> str:
    base = MYFATOORAH_API_URL.strip().rstrip("/")
    return f"{base}/{path.lstrip('/')}"


def to_decimal(val) -> Optional[Decimal]:
    if val is None:
        return None
    try:
        s = str(val).replace(",", "").strip()
        return Decimal(s)
    except Exception:
        return None


def parse_iso_dt(val: Optional[str]) -> Optional[datetime]:
    if not val:
        return None
    try:
        # MF dates are typically ISO-ish; fallback to naive parsing
        return datetime.fromisoformat(val.replace("Z", "+00:00"))
    except Exception:
        return None


def get_payment_status_from_myfatoorah(payment_id: str):
    resp = requests.post(
        _mf("GetPaymentStatus"),
        headers=_mf_headers(),
        json={"Key": payment_id, "KeyType": "PaymentId"},
        timeout=30,
    )
    resp.raise_for_status()
    print(
        "GetPaymentStatus>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>: 2222222222",
        resp.json(),
    )
    return resp.json()


def create_payment(
    db: Session,
    user_id,
    invoice_id,
    property_unit_id,
    property: str,
    property_unit: str,
    user_name: str,
    user_email: str,
    amount: float,
):
    print("Fatoorah URL:", MYFATOORAH_API_URL)
    print("Fatoorah API Key:", settings.MYFATOORAH_API_KEY[:10])

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .options(load_only(User.id, User.email, User.fname, User.lname))
        .first()
    )
    if not user:
        raise Exception(f"User {user_id} does not exist.")

    # 1) InitiatePayment → pick a valid method
    currency_iso = "KWD"
    try:
        ip_resp = requests.post(
            _mf("InitiatePayment"),
            json={"InvoiceAmount": float(amount), "CurrencyIso": currency_iso},
            headers=_mf_headers(),
            timeout=30,
        )
        ip_json = ip_resp.json()
        ip_resp.raise_for_status()
        if not ip_json.get("IsSuccess"):
            raise Exception(ip_json.get("Message") or "InitiatePayment failed")

        methods = (ip_json.get("Data") or {}).get("PaymentMethods") or []
        if not methods:
            raise Exception("No payment methods enabled for this account/currency.")

        # Prefer a card method if present
        def _norm(x: str) -> str:
            return (x or "").strip().lower()

        chosen = None
        for m in methods:
            name_en = _norm(m.get("PaymentMethodEn", ""))
            code = _norm(m.get("PaymentMethodCode", ""))
            if (
                "visa" in name_en
                or "master" in name_en
                or "card" in name_en
                or code in {"cc", "v-m"}
            ):
                chosen = m
                break
        chosen = chosen or methods[0]
        payment_method_id = chosen["PaymentMethodId"]
    except requests.RequestException as e:
        raise Exception(f"MyFatoorah InitiatePayment error: {e}")

    # 2) ExecutePayment
    payload = {
        "PaymentMethodId": payment_method_id,
        "CustomerName": user_name,
        "CustomerEmail": user_email or "",
        "CustomerReference": str(invoice_id),  # our invoice UUID as reference
        "UserDefinedField": str(user_id),
        "NotificationOption": "EML",
        "CallBackUrl": f"{settings.BACKEND_BASE_URL}/admin/payments/callback",
        "ErrorUrl": f"{settings.BACKEND_BASE_URL}/admin/payments/error",
        "Language": "en",
        "InvoiceValue": float(amount),
        "CurrencyIso": currency_iso,  # <<< Add currency here
    }

    try:
        ep_resp = requests.post(
            _mf("ExecutePayment"), json=payload, headers=_mf_headers(), timeout=30
        )
        ep_json = ep_resp.json()
        ep_resp.raise_for_status()
        if not ep_json.get("IsSuccess"):
            raise Exception(ep_json.get("Message") or "ExecutePayment failed")

        invoice_url = ep_json["Data"]["PaymentURL"]
        payment_id = ep_json["Data"]["InvoiceId"]  # MF internal invoice id
    except requests.RequestException as e:
        # Surface MF message if present
        msg = None
        try:
            msg = ep_json.get("Message")
        except Exception:
            pass
        raise Exception(f"MyFatoorah ExecutePayment error: {msg or e}")

    # Upsert PaymentHistory (PENDING)
    existing = (
        db.query(PaymentHistory)
        .filter(PaymentHistory.invoice_id == invoice_id)
        .filter(PaymentHistory.status == PaymentStatus.PENDING)
        .first()
    )
    if existing:
        existing.payment_url = invoice_url
        existing.amount = amount
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    row = PaymentHistory(
        invoice_id=invoice_id,
        user_id=user_id,
        payload=ep_json,
        payment_id=str(payment_id),
        property_unit_id=property_unit_id,
        amount=amount,
        currency=currency_iso,
        payment_type="RENT",
        payment_url=invoice_url,
        status=PaymentStatus.PENDING,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def process_payment_callback(payment_id: str, db: Session) -> str:
    print(
        "GetPaymentStatus>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>: 111111111111",
        payment_id,
    )
    info = get_payment_status_from_myfatoorah(payment_id)
    if not info.get("IsSuccess"):
        raise HTTPException(status_code=400, detail="MyFatoorah response failed")

    data = info.get("Data", {}) or {}
    invoice_status = (data.get("InvoiceStatus") or "").strip()
    invoice_ref = data.get("CustomerReference")  # our UUID
    if not invoice_ref:
        raise HTTPException(status_code=400, detail="Missing CustomerReference")

    payment = (
        db.query(PaymentHistory)
        .filter(PaymentHistory.invoice_id == invoice_ref)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    success = invoice_status.lower() in ["paid", "success"]
    failure = invoice_status.lower() in ["cancelled", "canceled", "failed"]

    payment.status = (
        PaymentStatus.SUCCESS
        if success
        else (PaymentStatus.FAILED if failure else PaymentStatus.PENDING)
    )
    payment.payload = info

    # Update your business invoice too
    inv = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
    if inv and invoice_status == "Paid":
        inv.status = "paid"
        inv.due_amount = 0
        inv.paid_amount = inv.total_amount
        inv.payment_date = datetime.utcnow().date()

        user = payment.user
        html_content = render_template(
            "paid_invoice.html",
            {
                "name": f"{user.fname} {user.lname}",
                "invoice_no": inv.invoice_no,
                "status": "paid",
                "payment_date": datetime.utcnow().date(),
            },
        )
        send_email(
            to_email=user.email,
            subject="Your Invoice has been paid",
            html_content=html_content,
        )

    db.commit()

    # >>> NEW: auto-extend ONLY for successful SUBSCRIPTION payments
    if success and (payment.payment_type or "").upper() == "SUBSCRIPTION":
        try:
            _extend_subscription_on_paid(db, payment)
        except Exception:
            pass

    return "Paid" if success else invoice_status or "Pending"


def generate_payment_error_redirect(
    payment_id: str, reference_id: str, reason: str
) -> str:
    query_params = {
        "paymentId": payment_id,
        "Id": reference_id,
        "reason": reason,
    }
    return f"{settings.FRONTEND_BASE_URL}/payments/failed?{urlencode(query_params)}"


def _get_deposited_invoices(deposit_reference: str) -> list[dict]:
    """Ask MF for all invoices included in this deposit batch."""
    r = requests.post(
        _mf("GetDepositedInvoices"),
        json={"DepositReference": deposit_reference},
        headers=_mf_headers(),
        timeout=30,
    )
    j = r.json()
    if r.status_code != 200 or not j.get("IsSuccess"):
        raise HTTPException(
            status_code=400, detail=j.get("Message", "MyFatoorah error")
        )
    return j.get("Data") or []


async def upsert_deposit_and_attach_invoices(
    db: Session,
    deposit_ref: str,
    deposit: dict,  # {date, amount, currency, count, bank_name, bank_iban, bank_account, raw}
):
    # 1) Upsert deposit header
    dep = db.query(BankDeposit).filter(BankDeposit.reference == deposit_ref).first()
    if not dep:
        dep = BankDeposit(
            reference=deposit_ref,
            deposit_date=parse_iso_dt(deposit.get("date")),
            amount=to_decimal(deposit.get("amount")),
            currency=deposit.get("currency"),
            transactions_count=deposit.get("count"),
            bank_name=deposit.get("bank_name"),
            bank_iban=deposit.get("bank_iban"),
            bank_account=deposit.get("bank_account"),
            raw=deposit.get("raw"),
        )
        db.add(dep)
        db.commit()
        db.refresh(dep)
    else:
        # keep it idempotent; update header if changed
        dep.deposit_date = dep.deposit_date or parse_iso_dt(deposit.get("date"))
        dep.amount = dep.amount or to_decimal(deposit.get("amount"))
        dep.currency = dep.currency or deposit.get("currency")
        dep.transactions_count = dep.transactions_count or deposit.get("count")
        if deposit.get("bank_name"):
            dep.bank_name = deposit.get("bank_name")
            dep.bank_iban = deposit.get("bank_iban")
            dep.bank_account = deposit.get("bank_account")
        if deposit.get("raw"):
            dep.raw = deposit.get("raw")
        db.commit()

    # 2) Fetch invoices inside this deposit
    mf_invoices = _get_deposited_invoices(deposit_ref)

    # 3) Reset detail rows (optional but simplest for idempotency)
    db.query(BankDepositItem).filter(BankDepositItem.deposit_id == dep.id).delete()

    # 4) Insert items & link back to PaymentHistory
    for inv in mf_invoices:
        invoice_ref = inv.get("InvoiceReference") or inv.get("CustomerReference")
        mf_invoice_id = str(inv.get("InvoiceId") or "")

        ph = None
        if invoice_ref:
            ph = (
                db.query(PaymentHistory)
                .filter(PaymentHistory.invoice_id == invoice_ref)
                .first()
            )
        if not ph and mf_invoice_id:
            ph = (
                db.query(PaymentHistory)
                .filter(PaymentHistory.payment_id == mf_invoice_id)
                .first()
            )

        db.add(
            BankDepositItem(
                deposit_id=dep.id,
                payment_history_id=ph.id if ph else None,
                invoice_id=ph.invoice_id if ph else None,
                invoice_reference=invoice_ref,
                invoice_value=to_decimal(inv.get("InvoiceValue")),
                currency=inv.get("Currency") or inv.get("PaidCurrency"),
                due_value=to_decimal(inv.get("DueValue")),
                service_charge=to_decimal(inv.get("TotalServiceCharge")),
                transaction_id=str(inv.get("TransactionId") or ""),
                payment_id=str(inv.get("PaymentId") or ""),
            )
        )

        if ph:
            # Mark payout succeeded for this payment
            ph.payout_status = "success"
            ph.deposit_reference = deposit_ref
            ph.deposit_date = dep.deposit_date or datetime.utcnow()

    db.commit()


def list_settlements_service(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    bank_name: Optional[str] = None,
    account_number: Optional[str] = None,
    search: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Paginated list of BankDeposit with optional filtering.
    - search: OR filter on bank_name / bank_account
    - bank_name, account_number: explicit AND filters
    """
    # Base query
    q = db.query(BankDeposit)

    # Free-text search across bank name & account number (OR)
    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                BankDeposit.bank_name.ilike(like),
                BankDeposit.bank_account.ilike(like),
            )
        )

    # Explicit filters (AND)
    conds = []
    if bank_name:
        conds.append(BankDeposit.bank_name.ilike(f"%{bank_name}%"))
    if account_number:
        conds.append(BankDeposit.bank_account.ilike(f"%{account_number}%"))
    if conds:
        q = q.filter(and_(*conds))

    # Accurate total BEFORE pagination
    count_sq = q.order_by(None).with_entities(BankDeposit.id).subquery()
    total = db.query(func.count()).select_from(count_sq).scalar() or 0

    # Page bounds
    page = max(1, int(page))
    page_size = max(1, min(int(page_size), 200))
    offset = (page - 1) * page_size

    # Sort: newest first (by deposit_date, then created_at)
    rows: List[BankDeposit] = (
        q.order_by(BankDeposit.deposit_date.desc(), BankDeposit.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = [
        {
            "reference": r.reference,
            "depositDate": r.deposit_date,
            "amount": r.amount,
            "currency": r.currency,
            "transactionsCount": r.transactions_count,
            "bank": {
                "name": r.bank_name,
                "iban": r.bank_iban,
                "accountNumber": r.bank_account,
            },
        }
        for r in rows
    ]

    return {
        "page": page,
        "pageSize": page_size,
        "total": total,
        "totalPages": ceil(total / page_size) if page_size else 0,
        "items": items,
        "success": True,
    }


# Mock Devs
# import uuid as _uuid
# import random as _random
# from datetime import timezone as _tz


# def _fake_ref(prefix="TEST") -> str:
#     return f"{prefix}-{datetime.utcnow().strftime('%Y%m%d')}-{_uuid.uuid4().hex[:8]}"


# def get_deposited_invoices_mock(
#     deposit_reference: str | None, tx_count: int = 2
# ) -> list[dict]:
#     """
#     Returns a list of mock 'deposited invoice' dicts resembling MyFatoorah's shape.
#     These are the fields our upsert uses.
#     """
#     if not deposit_reference:
#         deposit_reference = _fake_ref("TESTDEP")
#     items = []
#     for i in range(max(1, int(tx_count))):
#         # Make semi-realistic numbers
#         amount = round(_random.uniform(10, 200), 3)
#         service = round(amount * 0.03, 3)
#         items.append(
#             {
#                 "InvoiceReference": str(
#                     _uuid.uuid4()
#                 ),  # this would be your CustomerReference in real flow
#                 "InvoiceId": _random.randint(1000000, 9999999),
#                 "InvoiceValue": f"{amount:.3f}",
#                 "Currency": "KWD",
#                 "DueValue": f"{amount:.3f}",
#                 "TotalServiceCharge": f"{service:.3f}",
#                 "TransactionId": str(_random.randint(100000, 999999)),
#                 "PaymentId": f"MOCK{_random.randint(1000000000,9999999999)}",
#             }
#         )
#     return items


# async def upsert_deposit_and_attach_invoices_mock(
#     db: Session,
#     deposit_ref: str | None = None,
#     deposit: dict | None = None,
#     items: list[dict] | None = None,
# ):
#     """
#     Mock variant of upsert_deposit_and_attach_invoices.
#     - If deposit_ref is None, generates one.
#     - If items is None, generates mock items.
#     - Never calls MyFatoorah.
#     """
#     if not deposit_ref:
#         deposit_ref = _fake_ref("TESTDEP")

#     if items is None:
#         items = get_deposited_invoices_mock(
#             deposit_ref, tx_count=(deposit or {}).get("count") or 2
#         )

#     # derive a total if not supplied
#     total = None
#     try:
#         total = sum(to_decimal(x.get("InvoiceValue")) or 0.0 for x in items)
#     except Exception:
#         total = None

#     # Upsert header
#     dep = db.query(BankDeposit).filter(BankDeposit.reference == deposit_ref).first()
#     if not dep:
#         dep = BankDeposit(
#             reference=deposit_ref,
#             deposit_date=(deposit or {}).get("date")
#             or datetime.utcnow().replace(tzinfo=_tz.utc),
#             amount=(deposit or {}).get("amount") or total,
#             currency=(deposit or {}).get("currency") or "KWD",
#             transactions_count=(deposit or {}).get("count") or len(items),
#             bank_name=(deposit or {}).get("bank_name") or "Mock Bank",
#             bank_iban=(deposit or {}).get("bank_iban") or "KW00MOCK000000000000",
#             bank_account=(deposit or {}).get("bank_account") or "000000000000",
#             raw=(deposit or {}).get("raw") or {"mock": True},
#             created_at=datetime.utcnow(),
#         )
#         db.add(dep)
#         db.commit()
#         db.refresh(dep)
#     else:
#         # refresh summary (idempotent backfills)
#         dep.amount = (deposit or {}).get("amount") or total or dep.amount
#         dep.currency = (deposit or {}).get("currency") or dep.currency
#         dep.transactions_count = (deposit or {}).get("count") or len(items)
#         dep.bank_name = (deposit or {}).get("bank_name") or dep.bank_name
#         dep.bank_iban = (deposit or {}).get("bank_iban") or dep.bank_iban
#         dep.bank_account = (deposit or {}).get("bank_account") or dep.bank_account
#         dep.raw = (deposit or {}).get("raw") or dep.raw
#         db.commit()

#     # Clear old items to keep idempotency simple
#     db.query(BankDepositItem).filter(BankDepositItem.deposit_id == dep.id).delete()

#     for inv in items:
#         invoice_ref = inv.get("InvoiceReference") or inv.get("CustomerReference")
#         invoice_id = inv.get("InvoiceId")

#         # Try to match your PaymentHistory either by invoice_id (your UUID) or MyFatoorah InvoiceId
#         ph = None
#         if invoice_ref:
#             ph = (
#                 db.query(PaymentHistory)
#                 .filter(PaymentHistory.invoice_id == invoice_ref)
#                 .first()
#             )
#         if not ph and invoice_id:
#             ph = (
#                 db.query(PaymentHistory)
#                 .filter(PaymentHistory.payment_id == str(invoice_id))
#                 .first()
#             )

#         item = BankDepositItem(
#             deposit_id=dep.id,
#             payment_history_id=ph.id if ph else None,
#             invoice_id=ph.invoice_id if ph else None,
#             invoice_reference=invoice_ref,
#             invoice_value=to_decimal(inv.get("InvoiceValue")),
#             currency=inv.get("Currency") or inv.get("PaidCurrency"),
#             due_value=to_decimal(inv.get("DueValue")),
#             service_charge=to_decimal(inv.get("TotalServiceCharge")),
#             transaction_id=str(inv.get("TransactionId") or ""),
#             payment_id=str(inv.get("PaymentId") or ""),
#         )
#         db.add(item)

#         # Update payout state in your payment row
#         if ph:
#             ph.payout_status = "deposited"
#             ph.deposit_reference = dep.reference
#             ph.deposit_date = dep.deposit_date

#     db.commit()
