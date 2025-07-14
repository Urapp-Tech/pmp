from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.models.payment_history import PaymentHistory
from app.models.invoices import Invoice
from app.models.tenants import Tenant
from app.models.properties import Property as PropertyModel
from app.core.config import settings
from app.db.database import SessionLocal
from datetime import datetime, timezone
from sqlalchemy import func
import requests

MYFATOORAH_API_URL = settings.MYFATOORAH_API_URL
MYFATOORAH_API_KEY = settings.MYFATOORAH_API_KEY


def send_pending_payouts():
    """
    Cron job to send payouts for all PAID rental payments to suppliers.
    Automatically retries failed payouts on next run.
    """
    print(f"🏃 Running payout job at {datetime.now(timezone.utc)}")
    db = SessionLocal()
    try:
        # Fetch all payment history where status=PAID and payout_status is pending
        paid_payments = (
            db.query(PaymentHistory)
            .filter(
                PaymentHistory.status == "PAID",
                PaymentHistory.payout_status == "pending",
            )
            .all()
        )
        print(f"📄 Found {len(paid_payments)} payments ready for payout.")

        for payment in paid_payments:
            try:
                invoice = (
                    db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
                )
                if not invoice:
                    raise Exception(f"Invoice {payment.invoice_id} not found.")

                tenant = db.query(Tenant).filter(Tenant.id == invoice.tenant_id).first()
                if not tenant:
                    raise Exception(f"Tenant not found for invoice {invoice.id}.")

                # Validate tenant contract and status
                now = datetime.now()
                if not tenant.is_approved or not tenant.is_active:
                    raise Exception(f"Tenant {tenant.id} is not active/approved.")
                if tenant.contract_start > now or tenant.contract_end < now:
                    raise Exception(
                        f"Tenant {tenant.id} contract expired or not started."
                    )

                property_ = (
                    db.query(PropertyModel)
                    .filter(PropertyModel.id == tenant.property_id)
                    .first()
                )
                if not property_:
                    raise Exception(f"Property not found for tenant {tenant.id}.")

                supplier_code = property_.supplier_code
                if not supplier_code:
                    raise Exception(
                        f"Supplier code missing for property {property_.id}."
                    )

                # Prepare payout payload
                payout_payload = {
                    "SupplierCode": supplier_code,
                    "Amount": invoice.total_amount,
                    "CurrencyIso": "KWD",
                    "Comments": f"Payout for invoice {invoice.invoice_no}",
                }

                headers = {
                    "Authorization": f"Bearer {MYFATOORAH_API_KEY}",
                    "Content-Type": "application/json",
                }

                print(
                    f"🔗 Initiating payout to supplier {supplier_code} for {invoice.total_amount} KWD"
                )

                # Send payout request
                response = requests.post(
                    f"{MYFATOORAH_API_URL}/Suppliers/Payout",
                    json=payout_payload,
                    headers=headers,
                )

                # Handle response
                if response.status_code == 200 and response.json().get("IsSuccess"):
                    print(f"✅ Payout successful for payment {payment.id}")
                    payment.payout_status = "success"
                    if payment.payout_error:  # If there was a previous error
                        payment.payout_error = "resolved"
                    payment.updated_at = func.now()
                else:
                    error_message = response.json().get("Message", response.text)
                    raise Exception(f"MyFatoorah payout API failed: {error_message}")

            except Exception as e:
                # Log error and keep payout_status = pending for retry
                print(f"❌ Payout failed for payment {payment.id}: {e}")
                payment.payout_error = str(e)
                payment.updated_at = func.now()

            finally:
                db.commit()

    except Exception as e:
        print(f"❌ Critical payout job error: {e}")
    finally:
        db.close()
