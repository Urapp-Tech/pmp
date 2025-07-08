from apscheduler.schedulers.background import BackgroundScheduler
from app.jobs.generate_invoice import generate_and_send_invoices

# Create global scheduler instance
scheduler = BackgroundScheduler()

# testing
# def start_scheduler():
#     """Start APScheduler jobs (testing mode: runs every 10 seconds)"""
#     scheduler.add_job(
#         func=generate_and_send_invoices,  # Your job function
#         trigger="interval",
#         seconds=10,  # ✅ Run every 10s for testing
#         id="invoice_generation_test_job",
#         replace_existing=True,
#     )
#     scheduler.start()
#     print("✅ [TEST] Scheduler started and running every 10 seconds")


# production
def start_scheduler():
    """Start APScheduler jobs"""
    scheduler.add_job(
        func=generate_and_send_invoices,
        trigger="cron",
        hour=0,  # Run every day at midnight
        id="invoice_generation_job",
        replace_existing=True,
    )
    scheduler.start()
    print("✅ Scheduler started and job scheduled for midnight daily")
