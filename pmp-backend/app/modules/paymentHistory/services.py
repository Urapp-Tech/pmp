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


# def create_payment(
#     db: Session,
#     user_id: UUID,
#     invoice_id: UUID,
#     property_unit_id: UUID,
#     property: str,
#     property_unit: str,
#     user_name: str,
#     user_email: str,
#     user_phone: str,
#     amount: float,
# ):
#     print("Fatoorah URL:", MYFATOORAH_API_URL)
#     print("Fatoorah API Key:", settings.MYFATOORAH_API_KEY[:10])

#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise Exception(
#             f"User with ID {user_id} does not exist. Cannot create payment."
#         )

#     # MyFatoorah payload
#     payload = {
#         "CustomerName": user_name,
#         "CustomerEmail":user_email ,  # Dummy email for test
#         # "MobileCountryCode": "+965",  # Dummy Kuwait code for test
#         "CustomerMobile":user_phone ,  # Dummy mobile for test
#         "CustomerReference": str(invoice_id),  # Helps map payment later
#         "UserDefinedField": str(user_id),
#         "NotificationOption": "ALL",
#         "CallBackUrl": "http://localhost:8000/admin/payments/callback",
#         "ErrorUrl": "http://localhost:8000/admin/payments/error",
#         "WebhookUrl": "http://localhost:8000/api/v1/payment/webhook",
#         "Language": "en",
#         "InvoiceValue": amount,
#         # "CustomerAddress": {  # Dummy address for test
#         #     "Block": "10",
#         #     "Street": "Test Street",
#         #     "HouseBuildingNo": "5",
#         #     "AddressInstructions": "Near test landmark",
#         # },
#         "InvoiceItems": [  # Add a single dummy item
#             {
#                 "ItemName": property + " - " + property_unit + " - " + "rent",
#                 "Quantity": 1,
#                 "UnitPrice": amount,
#                 "Weight": 0,
#                 "Width": 0,
#                 "Height": 0,
#                 "Depth": 0,
#             }
#         ],
#         "ProcessingDetails": {"AutoCapture": True, "Bypass3DS": True},
#     }

#     headers = {
#         "Authorization": f"Bearer {settings.MYFATOORAH_API_KEY}",
#         "Content-Type": "application/json",
#     }

#     try:
#         response = requests.post(MYFATOORAH_API_URL, json=payload, headers=headers)
#         response.raise_for_status()  # Raise exception for HTTP errors
#         payment_data = response.json()

#         print("Payment API response:", payment_data)

#         payment = PaymentHistory(
#             invoice_id=invoice_id,
#             user_id=user_id,
#             property_unit_id=property_unit_id,
#             amount=amount,  # ✅ FIXED
#             currency="KWD",  # Or get from invoice if needed
#             payment_type="RENT",  # ✅ FIXED
#             payment_url=payment_data["Data"]["InvoiceURL"],
#             status=PaymentStatus.PENDING,
#         )
#         db.add(payment)
#         db.commit()
#         db.refresh(payment)

#         return payment


#     except requests.RequestException as e:
#         # Log error and raise custom exception
#         print("Payment API call failed:", e)
#         raise Exception(f"MyFatoorah API Error: {e}")
def create_payment(
    db: Session,
    user_id: UUID,
    invoice_id: UUID,
    property_unit_id: UUID,
    property: str,
    supplier_code: Optional[str],
    property_unit: str,
    user_name: str,
    user_email: str,
    # user_phone: str,
    amount: float,
):
    print("Fatoorah URL:", MYFATOORAH_API_URL)
    print("Fatoorah API Key:", settings.MYFATOORAH_API_KEY[:10])

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .options(
            load_only(
                User.id, User.email, User.fname, User.lname
            )  # Load only required fields
        )
        .first()
    )
    if not user:
        raise Exception(
            f"User with ID {user_id} does not exist. Cannot create payment."
        )

    # print("supplier_code found:", type(supplier_code), Number(supplier_code))

    # Prepare MyFatoorah payload
    payload = {
        "CustomerName": user_name,
        "CustomerEmail": user_email,
        # "CustomerMobile": user_phone,
        "CustomerReference": str(invoice_id),
        "UserDefinedField": str(user_id),
        "NotificationOption": "EML",
        "CallBackUrl": f"{settings.BACKEND_BASE_URL}/admin/payments/callback",
        "ErrorUrl": f"{settings.BACKEND_BASE_URL}/admin/payments/error",
        "WebhookUrl": f"{settings.BACKEND_BASE_URL}/api/v1/payment/webhook",
        "Language": "en",
        "InvoiceValue": amount,
        "InvoiceItems": [
            {
                "ItemName": f"{property} - {property_unit} - rent",
                "Quantity": 1,
                "UnitPrice": amount,
                "Weight": 0,
                "Width": 0,
                "Height": 0,
                "Depth": 0,
            }
        ],
        "Suppliers": [
            {
            "SupplierCode": supplier_code,
            "ProposedShare": None,
            "InvoiceShare":  amount,
            }
        ],
        "ProcessingDetails": {"AutoCapture": True, "Bypass3DS": True},
    }

    headers = {
        "Authorization": f"Bearer {settings.MYFATOORAH_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        # 🧾 Call MyFatoorah API
        response = requests.post(
            f"{MYFATOORAH_API_URL}/SendPayment", json=payload, headers=headers
        )
        print("✅  res", response.json())
        response.raise_for_status()
        payment_data = response.json()
        invoice_url = payment_data["Data"]["InvoiceURL"]
        payment_id = payment_data["Data"]["InvoiceId"]

        # print("✅  res", response, payment_id)
        # ✅ Check if payment already exists
        # print("Checking for existing pending payment...", invoice_id)
        existing_payment = (
            db.query(PaymentHistory)
            .filter(PaymentHistory.invoice_id == invoice_id)
            .filter(PaymentHistory.status == PaymentStatus.PENDING)
            .first()
        )

        if existing_payment:
            print("Updating existing pending payment...")
            existing_payment.payment_url = invoice_url
            existing_payment.amount = amount  # Optional: in case amount changed
            existing_payment.updated_at = datetime.utcnow()  # Optional
            db.commit()
            db.refresh(existing_payment)
            return existing_payment

        # ❌ If not exists, create new payment
        payment = PaymentHistory(
            invoice_id=invoice_id,
            user_id=user_id,
            payload=payment_data,
            payment_id=payment_id,
            property_unit_id=property_unit_id,
            amount=amount,
            currency="KWD",
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
        raise Exception(f"MyFatoorah API Error: {e}")


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
