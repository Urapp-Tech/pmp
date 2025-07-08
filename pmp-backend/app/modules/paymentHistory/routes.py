from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from app.modules.paymentHistory.schemas import PaymentResponse, CreatePaymentRequest
from app.modules.paymentHistory.services import (
    process_payment_callback,
    generate_payment_error_redirect,
    create_payment,
)
from app.db.database import get_db
from app.models.payment_history import PaymentStatus, PaymentHistory
from urllib.parse import urlencode

# from fastapi.security import OAuth2PasswordBearer
from app.core.security import get_current_user
from fastapi.responses import RedirectResponse
from app.core.config import settings
from app.utils.logger import error_log  # adjust this import if needed

router = APIRouter()


@router.post("/create", response_model=PaymentResponse)
def create_payment_endpoint(
    payment_data: CreatePaymentRequest, db: Session = Depends(get_db)
):
    try:
        payment = create_payment(
            db,
            user_id=payment_data.user_id,
            invoice_id=payment_data.invoice_id,
            property_unit_id=payment_data.property_unit_id,
            property=payment_data.property,
            property_unit=payment_data.property_unit,
            user_email=payment_data.user_email,
            # user_phone=payment_data.user_phone,
            user_name=payment_data.user_name,
            amount=payment_data.amount,
        )
        return {
            "payment_url": payment.payment_url,
            "invoice_id": payment.invoice_id,
            "status": payment.status,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/callback")
def payment_callback_browser(paymentId: str, db: Session = Depends(get_db)):
    # try:
    invoice_status = process_payment_callback(paymentId, db)
    if invoice_status == "Paid":
        url = f"{settings.FRONTEND_BASE_URL}/payments/success?paymentId={paymentId}"
    else:
        url = f"{settings.FRONTEND_BASE_URL}/payments/failed?paymentId={paymentId}&reason={invoice_status}"
    # except Exception as e:
    #     url = f"{settings.FRONTEND_BASE_URL}payments/failed?paymentId={paymentId}&reason=error"

    return RedirectResponse(url=url)


@router.get("/error")
def payment_error_browser(
    paymentId: str,
    Id: str,
    reason: str = "Payment failed or was cancelled. Please try again.",
):
    redirect_url = generate_payment_error_redirect(paymentId, Id, reason)
    return RedirectResponse(url=redirect_url)


@router.post("/webhook")
async def myfatoorah_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    print(payload)
    invoice_ref = payload.get("CustomerReference") or payload.get("InvoiceReference")
    invoice_status = payload.get("InvoiceStatus") or payload.get("InvoicePaymentStatus")

    if not invoice_ref or not invoice_status:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    payment = (
        db.query(PaymentHistory)
        .filter(PaymentHistory.invoice_id == invoice_ref)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    status_map = {
        "paid": PaymentStatus.SUCCESS,
        "failed": PaymentStatus.FAILED,
        "cancelled": PaymentStatus.FAILED,
    }
    payment.status = status_map.get(invoice_status.lower(), PaymentStatus.PENDING)
    db.commit()

    return {"message": "Payment status updated successfully"}
