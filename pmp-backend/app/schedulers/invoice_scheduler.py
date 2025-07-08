# app/scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.jobs.invoice_task import daily_task
from app.utils.logger import  error_log


def start_scheduler():
    scheduler = BackgroundScheduler()
    
    # CronTrigger: Run at 12:00 AM every day
    trigger = CronTrigger(hour=0, minute=0)
    error_log("starting scheduler")
    scheduler.add_job(daily_task, trigger, id="daily_job", replace_existing=True)
    scheduler.start()
