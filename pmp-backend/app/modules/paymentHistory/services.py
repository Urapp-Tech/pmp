from sqlalchemy.orm import Session
from app.models.payment_history import PaymentHistory, PaymentStatus
from app.models.users import User

# from app.modules.paymentHistory.schemas import PaymentCreate
from app.utils.myfatoorah_service import create_invoice
from uuid import UUID
import requests
from app.core.config import settings


MYFATOORAH_API_URL = settings.MYFATOORAH_API_URL
MYFATOORAH_API_KEY = settings.MYFATOORAH_API_KEY


def create_payment(
    db: Session,
    user_id: UUID,
    invoice_id: UUID,
    user_name: str,
    amount: float,
    payment_type: str,
):
    print("Fatoorah URL:", MYFATOORAH_API_URL)
    print("Fatoorah API Key:", settings.MYFATOORAH_API_KEY[:10])

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise Exception(
            f"User with ID {user_id} does not exist. Cannot create payment."
        )

    # MyFatoorah payload
    payload = {
        "CustomerName": user_name,
        "CustomerEmail": "test@example.com",  # Dummy email for test
        "MobileCountryCode": "+965",  # Dummy Kuwait code for test
        "CustomerMobile": "12345678",  # Dummy mobile for test
        "CustomerReference": str(invoice_id),  # Helps map payment later
        "UserDefinedField": str(user_id),
        "NotificationOption": "LNK",
        "CallBackUrl": "http://localhost:8000/admin/payments/callback",
        "ErrorUrl": "http://localhost:8000/admin/payments/error",
        "WebhookUrl": "http://localhost:8000/api/v1/payment/webhook",
        "Language": "en",
        "InvoiceValue": amount,
        "CustomerAddress": {  # Dummy address for test
            "Block": "10",
            "Street": "Test Street",
            "HouseBuildingNo": "5",
            "AddressInstructions": "Near test landmark",
        },
        "InvoiceItems": [  # Add a single dummy item
            {
                "ItemName": "Test Payment",
                "Quantity": 1,
                "UnitPrice": amount,
                "Weight": 0,
                "Width": 0,
                "Height": 0,
                "Depth": 0,
            }
        ],
        "ProcessingDetails": {"AutoCapture": True, "Bypass3DS": True},
    }

    headers = {
        "Authorization": f"Bearer {settings.MYFATOORAH_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(MYFATOORAH_API_URL, json=payload, headers=headers)
        response.raise_for_status()  # Raise exception for HTTP errors
        payment_data = response.json()

        print("Payment API response:", payment_data)

        payment = PaymentHistory(
            invoice_id=invoice_id,
            user_id=user_id,
            amount=amount,  # ✅ FIXED
            currency="KWD",  # Or get from invoice if needed
            payment_type=payment_type,  # ✅ FIXED
            payment_url=payment_data["Data"]["InvoiceURL"],
            status=PaymentStatus.PENDING,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        return payment

    except requests.RequestException as e:
        # Log error and raise custom exception
        print("Payment API call failed:", e)
        raise Exception(f"MyFatoorah API Error: {e}")
