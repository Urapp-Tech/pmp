from datetime import datetime, timezone, timedelta
from app.db.database import SessionLocal
from app.modules.invoices.services import (
    create_next_invoice,
    get_tenants_with_upcoming_date,
)
from app.utils.email_service import send_email

# for testing


# for production
def generate_and_send_invoices():

    print(f"🏃 [PROD] Running job at {datetime.now(timezone.utc)}")
    db = SessionLocal()  # ✅ Create DB session
    try:
        invoices = get_tenants_with_upcoming_date(db, days_before_due=7)

        for invoice in invoices:
            print(f"🔄 [PROD] Generating next invoice for tenant {invoice.tenant_id}")
            create_next_invoice(db, invoice)

    except Exception as e:
        print(f"❌ [PROD] Error in job: {e}")
    finally:
        db.close()
