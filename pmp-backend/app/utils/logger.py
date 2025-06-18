import logging
from logging.handlers import TimedRotatingFileHandler
import os
import sys
import traceback
import json

def setup_global_logger(log_dir="logs", level=logging.ERROR):
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "error.log")

    logger = logging.getLogger()
    logger.setLevel(level)

    if not logger.handlers:
        handler = TimedRotatingFileHandler(
            filename=log_file,
            when="midnight",
            interval=1,
            backupCount=7,
            encoding="utf-8",
            utc=True
        )
        handler.suffix = "%Y-%m-%d"
        formatter = logging.Formatter(
            "%(asctime)s [%(levelname)s] %(message)s\n"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    # Global error handler
    def handle_exception(exc_type, exc_value, exc_traceback):
        if issubclass(exc_type, KeyboardInterrupt):
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return
        logger.critical(
            "Uncaught exception:\n%s",
            "".join(traceback.format_exception(exc_type, exc_value, exc_traceback))
        )

    sys.excepthook = handle_exception

def error_log(error: Exception, message: str = "Error occurred"):
    logger = logging.getLogger()
    full_traceback = "".join(traceback.format_exception(type(error), error, error.__traceback__))
    logger.error(f"{message}:\n{full_traceback}")

def debug_log(data, context: str = ""):
    logger = logging.getLogger("")
    try:
        log_obj = {
            "context": context,
            "debug": data
        }
        logger.error(json.dumps(log_obj, indent=2, default=str))
    except Exception as e:
        logger.error(f"Failed to log debug data: {e}")
        logger.error(str(data))