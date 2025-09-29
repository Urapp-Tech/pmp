from datetime import datetime
import json

from typing import Optional
from fastapi import HTTPException, Request
from sqlalchemy.orm import Session, joinedload, load_only
from app.models.invoices import Invoice
from app.models.payment_history import PaymentHistory, PaymentStatus
from app.models.users import User

# from app.modules.paymentHistory.schemas import PaymentCreate
# from app.utils.myfatoorah_service import create_invoice
from uuid import UUID
import requests
from app.core.config import settings
from urllib.parse import urlencode
from app.utils.email_service import render_template, send_email

MYFATOORAH_API_URL = settings.MYFATOORAH_API_URL
MYFATOORAH_API_KEY = settings.MYFATOORAH_API_KEY


def create_payment(
    db: Session,
    user_id: UUID,
    invoice_id: UUID,
    property_unit_id: UUID,
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
        raise Exception(
            f"User with ID {user_id} does not exist. Cannot create payment."
        )

    headers = {
        "Authorization": f"Bearer {settings.MYFATOORAH_API_KEY}",
        "Content-Type": "application/json",
    }

    # ---------- 1) INITIATE PAYMENT: get available methods ----------
    currency_iso = "KWD"  # set to your account currency (e.g., KWD, SAR, BHD, QAR, AED)
    try:
        ip_resp = requests.post(
            f"{MYFATOORAH_API_URL}/InitiatePayment",
            json={"InvoiceAmount": float(amount), "CurrencyIso": currency_iso},
            headers=headers,
        )
        ip_json = ip_resp.json()
        print("InitiatePayment response:", ip_json)
        ip_resp.raise_for_status()

        if not ip_json.get("IsSuccess"):
            raise Exception(f"InitiatePayment failed: {ip_json.get('Message')}")
        methods = ip_json.get("Data", {}).get("PaymentMethods", []) or []
        if not methods:
            raise Exception(
                "No payment methods are enabled for this account/currency in apitest."
            )

        # Prefer a card method if present; else pick the first available
        def _norm(x: str) -> str:
            return (x or "").strip().lower()

        preferred = None
        for m in methods:
            name_en = _norm(m.get("PaymentMethodEn", ""))
            code = _norm(m.get("PaymentMethodCode", ""))
            if (
                "visa" in name_en
                or "master" in name_en
                or "card" in name_en
                or code in {"cc", "v-m"}
            ):
                preferred = m
                break
        chosen_method = preferred or methods[0]
        payment_method_id = chosen_method["PaymentMethodId"]
    except requests.RequestException as e:
        print("InitiatePayment call failed:", e)
        raise Exception(f"MyFatoorah InitiatePayment error: {e}")

    # ---------- 2) EXECUTE PAYMENT with the valid PaymentMethodId ----------
    payload = {
        "PaymentMethodId": payment_method_id,
        "CustomerName": user_name,
        "CustomerEmail": user_email or "",
        "CustomerReference": str(invoice_id),
        "UserDefinedField": str(user_id),
        "NotificationOption": "EML",  # EML / SMS / ALL
        "CallBackUrl": f"{settings.BACKEND_BASE_URL}/admin/payments/callback",
        "ErrorUrl": f"{settings.BACKEND_BASE_URL}/admin/payments/error",
        "Language": "en",
        "InvoiceValue": float(amount),
        # Optional:
        # "InvoiceItems": [{"ItemName": f"{property} - {property_unit} - rent", "Quantity": 1, "UnitPrice": float(amount)}],
        # "ProcessingDetails": {"AutoCapture": True},  # only if your account supports it
    }

    try:
        ep_resp = requests.post(
            f"{MYFATOORAH_API_URL}/ExecutePayment", json=payload, headers=headers
        )
        print("ExecutePayment raw:", ep_resp.text)
        ep_json = ep_resp.json()
        ep_resp.raise_for_status()

        if not ep_json.get("IsSuccess"):
            raise Exception(f"ExecutePayment failed: {ep_json.get('Message')}")

        invoice_url = ep_json["Data"]["PaymentURL"]
        payment_id = ep_json["Data"]["InvoiceId"]

        # Upsert your PaymentHistory as you already do
        existing_payment = (
            db.query(PaymentHistory)
            .filter(PaymentHistory.invoice_id == invoice_id)
            .filter(PaymentHistory.status == PaymentStatus.PENDING)
            .first()
        )

        if existing_payment:
            existing_payment.payment_url = invoice_url
            existing_payment.amount = amount
            existing_payment.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_payment)
            return existing_payment

        payment = PaymentHistory(
            invoice_id=invoice_id,
            user_id=user_id,
            payload=ep_json,
            payment_id=payment_id,
            property_unit_id=property_unit_id,
            amount=amount,
            currency=currency_iso,
            payment_type="RENT",
            payment_url=invoice_url,
            status=PaymentStatus.PENDING,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    except requests.RequestException as e:
        print("Payment API call failed:", e)
        # surface the API message if present
        try:
            msg = ep_json.get("Message")  # type: ignore
        except Exception:
            msg = None
        raise Exception(f"MyFatoorah ExecutePayment error: {msg or e}")


def process_payment_callback(payment_id: str, db: Session) -> str:
    # Step 1: Get payment status from MyFatoorah
    payment_info = get_payment_status_from_myfatoorah(payment_id)

    if not payment_info.get("IsSuccess"):
        raise HTTPException(status_code=400, detail="MyFatoorah response failed")

    # Actual payment details are inside Data
    payment_data = payment_info.get("Data", {})
    invoice_status = payment_data.get("InvoiceStatus")  # ✅ Correct now
    invoice_value = payment_data.get("InvoiceValue")
    invoice_id = payment_data.get("CustomerReference")
    # invoice_id = str(payment_data.get("InvoiceId"))
    payment_data = payment_info  # Full payload

    # Step 2: Find payment
    payment = (
        db.query(PaymentHistory).filter(PaymentHistory.invoice_id == invoice_id).first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    # Step 3: Update payment
    payment.status = (
        PaymentStatus.SUCCESS if invoice_status == "Paid" else PaymentStatus.FAILED
    )
    payment.payload = payment_data
    user = payment.user

    # Step 4: Update invoice
    invoice = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
    if invoice and invoice_status == "Paid":
        invoice.status = "paid"
        invoice.due_amount = 0
        invoice.paid_amount = invoice.total_amount
        invoice.payment_date = datetime.utcnow().date()
        html_content = render_template(
            "paid_invoice.html",
            {
                "name": f"{user.fname} {user.lname}",
                "invoice_no": invoice.invoice_no,
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

    return invoice_status


def generate_payment_error_redirect(
    payment_id: str, reference_id: str, reason: str
) -> str:
    query_params = {
        "paymentId": payment_id,
        "Id": reference_id,
        "reason": reason,
    }
    return f"{settings.FRONTEND_BASE_URL}/payments/failed?{urlencode(query_params)}"


def get_payment_status_from_myfatoorah(payment_id: str):
    url = "https://apitest.myfatoorah.com/v2/GetPaymentStatus"
    headers = {
        "Authorization": f"Bearer {settings.MYFATOORAH_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"Key": payment_id, "KeyType": "PaymentId"}

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()  # raises exception for HTTP errors
    return response.json()
