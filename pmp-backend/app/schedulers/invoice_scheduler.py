from apscheduler.schedulers.background import BackgroundScheduler
from app.jobs.generate_invoice import generate_and_send_invoices

# Create global scheduler instance
scheduler = BackgroundScheduler()


# testing
def start_scheduler():
    scheduler.add_job(
        func=generate_and_send_invoices,
        trigger="interval",
        days=1,  # ✅ Run every 1 day
        id="invoice_generation_job",
        replace_existing=True,
    )
    scheduler.start()
    print("✅ Scheduler started and job scheduled for daily once a day")


# production
# def start_scheduler():
#     """Start APScheduler jobs"""
#     scheduler.add_job(
#         func=generate_and_send_invoices,
#         trigger="cron",
#         hour=0,  # Run every day at midnight
#         id="invoice_generation_job",
#         replace_existing=True,
#     )
#     scheduler.start()
#     print("✅ Scheduler started and job scheduled for midnight daily")
