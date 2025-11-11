from fastapi import Query, APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from app.modules.paymentHistory.schemas import PaymentResponse, CreatePaymentRequest
from app.modules.paymentHistory.services import (
    process_payment_callback,
    generate_payment_error_redirect,
    create_payment,
    upsert_deposit_and_attach_invoices,
    list_settlements_service,
)
from app.db.database import get_db
from app.models.payment_history import PaymentStatus, PaymentHistory
from app.models.bank_deposit import BankDeposit
from app.models.bank_deposit_item import BankDepositItem
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
            # supplier_code=payment_data.supplier_code,
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
    print("invoice_status", invoice_status)
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


@router.post("/webhook/settlement")
async def myfatoorah_settlement_webhook(
    request: Request, db: Session = Depends(get_db)
):
    payload = await request.json()

    # Expected structure for balance transferred event
    event = payload.get("Event", {})
    code = str(event.get("Code", ""))  # "3" for balance transferred (in MF docs)
    data = payload.get("Data", {})
    deposit = data.get("Deposit") or {}
    bank = data.get("Bank") or {}

    # Ignore non-balance-transferred events hitting this endpoint
    if code != "3":
        return {"ok": True}

    deposit_ref = deposit.get("Reference")
    if not deposit_ref:
        raise HTTPException(status_code=400, detail="Missing Deposit.Reference")

    await upsert_deposit_and_attach_invoices(
        db=db,
        deposit_ref=deposit_ref,
        deposit=dict(
            date=deposit.get("DepositDate"),
            amount=deposit.get("ValueInBaseCurrency"),
            currency=deposit.get("BaseCurrency"),
            count=deposit.get("NumberOfTransactions"),
            bank_name=bank.get("Name"),
            bank_iban=bank.get("IBAN"),
            bank_account=bank.get("AccountNumber"),
            raw=payload,
        ),
    )

    return {"ok": True, "reference": deposit_ref}


@router.get("/settlements")
def list_settlements(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    pageSize: int = Query(20, ge=1, le=200, description="Items per page"),
    bankName: str | None = Query(None, description="Filter by bank name (contains)"),
    accountNumber: str | None = Query(
        None, description="Filter by bank account number (contains)"
    ),
    search: str | None = Query(
        None, description="Free-text search across bank name & account number"
    ),
):
    return list_settlements_service(
        db=db,
        page=page,
        page_size=pageSize,
        bank_name=bankName,
        account_number=accountNumber,
        search=search,
    )


@router.get("/settlements/{deposit_reference}")
def settlement_detail(deposit_reference: str, db: Session = Depends(get_db)):
    dep = (
        db.query(BankDeposit).filter(BankDeposit.reference == deposit_reference).first()
    )
    if not dep:
        raise HTTPException(status_code=404, detail="Deposit not found")

    items = db.query(BankDepositItem).filter(BankDepositItem.deposit_id == dep.id).all()
    return {
        "deposit": {
            "reference": dep.reference,
            "depositDate": dep.deposit_date,
            "amount": dep.amount,
            "currency": dep.currency,
            "transactionsCount": dep.transactions_count,
            "bank": {
                "name": dep.bank_name,
                "iban": dep.bank_iban,
                "accountNumber": dep.bank_account,
            },
        },
        "invoices": [
            {
                "paymentHistoryId": it.payment_history_id,
                "invoiceId": it.invoice_id,
                "invoiceReference": it.invoice_reference,
                "invoiceValue": it.invoice_value,
                "currency": it.currency,
                "dueValue": it.due_value,
                "serviceCharge": it.service_charge,
                "transactionId": it.transaction_id,
                "paymentId": it.payment_id,
            }
            for it in items
        ],
    }
