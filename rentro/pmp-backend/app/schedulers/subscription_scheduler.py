# app/schedulers/subscription_scheduler.py
from apscheduler.triggers.cron import CronTrigger
from app.schedulers.scheduler import scheduler
from app.db.database import SessionLocal
from app.modules.subscriptions.services import (
    generate_payment_links_for_upcoming_expiry,
    expire_and_deactivate_properties,
)

TZ = "Asia/Karachi"  # run at local time; change if you want UTC


def _job_generate_links():
    with SessionLocal() as db:
        # 7 days before expiry; adjust if you want a different horizon
        generate_payment_links_for_upcoming_expiry(db, days_before=7)


def _job_expire_and_deactivate():
    with SessionLocal() as db:
        expire_and_deactivate_properties(db)


def schedule_subscription_jobs():
    # Daily 02:00 — generate links for upcoming expiries
    scheduler.add_job(
        _job_generate_links,
        CronTrigger(hour=2, minute=0, timezone=TZ),
        id="subs_generate_payment_links",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    # Daily 02:30 — deactivate properties for expired subs
    scheduler.add_job(
        _job_expire_and_deactivate,
        CronTrigger(hour=2, minute=30, timezone=TZ),
        id="subs_expire_and_deactivate",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
