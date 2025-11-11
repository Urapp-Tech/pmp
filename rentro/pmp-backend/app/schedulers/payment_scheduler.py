from app.schedulers.scheduler import scheduler
from app.jobs.generate_payment_payout import send_pending_payouts


# testing
def schedule_payout_processing():
    scheduler.add_job(
        func=send_pending_payouts,
        trigger="cron",
        hour=1,  # Every day at 1 AM
        id="payout_job",
        replace_existing=True,
    )
    print("✅ Payment Scheduler started and job scheduled for daily once a day")
