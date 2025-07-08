from app.utils.logger import  error_log 

def daily_task():
    error_log("starting scheduler")
    print("Running daily task at 12:00 AM")
    # Your logic here (e.g., database cleanup, email sending, etc.)
