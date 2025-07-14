from app.schedulers.scheduler import scheduler
from app.jobs.generate_invoice import generate_and_send_invoices


def schedule_invoice_generation():
    scheduler.add_job(
        func=generate_and_send_invoices,
        trigger="interval",
        days=1,  # Every day
        id="invoice_generation_job",
        replace_existing=True,
    )
    print("✅ Invoice generation job scheduled")


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
