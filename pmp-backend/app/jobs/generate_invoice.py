from datetime import datetime, timezone, timedelta
from app.db.database import SessionLocal
from app.modules.invoices.services import (
    create_next_invoice,
    get_tenants_with_upcoming_date,
)
from app.utils.email_service import send_email

# from app.utils.email_service import send_email


# def generate_and_send_invoices():
#     """Job to check invoices and send reminders"""
#     print(f"🏃 Running job: {datetime.now()}")

#     # Find all tenants with invoices due in 7 days
#     tenants = get_tenants_with_upcoming_date(days_before_due=7)

#     for tenant in tenants:
#         # Generate next invoice
#         create_next_invoice(tenant)

#         # Send reminder email
#         # send_email(tenant, new_invoice)


# def generate_and_send_invoices():
#     """Job to check invoices and send reminders"""
#     print(f"🏃 Running job: {datetime.now()}")

#     # ✅ Find tenants with invoices due within the next 60 seconds (testing)
#     tenants = get_tenants_with_upcoming_date(days_before_due=0)  # Pass 0 for now

#     for tenant in tenants:
#         # Generate next invoice
#         create_next_invoice(tenant)

#         # Log for testing
#         print(f"✅ New invoice generated for tenant {tenant.id}")


# for testing
# def generate_and_send_invoices():
#     """TESTING: Job to generate invoices ignoring due_date"""
#     print(f"🏃 [TEST] Running job at {datetime.now()}")
#     db = SessionLocal()  # ✅ Create DB session
#     try:
#         invoices = get_all_invoices_for_testing(db)  # Fetch all

#         for invoice in invoices:
#             print(f"🔄 [TEST] Generating next invoice for tenant {invoice.tenant_id}")
#             create_next_invoice(db, invoice)

#     except Exception as e:
#         print(f"❌ [TEST] Error in job: {e}")
#     finally:
#         db.close()


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
