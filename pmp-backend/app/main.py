import os
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.modules.superusers.routes import router as superuser_router
from app.modules.users.routes import router as user_router
from app.modules.permissions.routes import router as permission_router
from app.modules.roles.routes import router as role_router
from app.modules.securityLogs.routes import router as security_log_router
from app.modules.landlords.routes import router as landlord_router
from app.modules.properties.routes import router as property_router
from app.modules.invoices.routes import router as invoice_router
from app.utils.logger import setup_global_logger, error_log, debug_log
import logging
from app.modules.supportTickets.routes import router as support_router
from fastapi.staticfiles import StaticFiles
from app.modules.managers.routes import router as manager_router
from app.modules.propertyUnits.routes import router as property_units_router
from app.modules.tenants.routes import router as tenants_router
from app.modules.invoiceItems.routes import router as invoice_item_router
from app.utils.uploader import get_file_base_url
from app.modules.dashboardActivities.routes import router as dashboard_activity_router
from app.modules.reports.routes import router as report_router

from app.schedulers.invoice_scheduler import start_scheduler, scheduler
from app.jobs.generate_invoice import generate_and_send_invoices
from contextlib import asynccontextmanager

# from app.schedulers.invoice_scheduler import start_scheduler
from app.modules.paymentHistory.routes import router as payment_router

from app.utils.email_service import render_template, send_email
from app.utils.email_service import template_env

app = FastAPI(
    docs_url="/docs",  # disables Swagger UI (/docs)
    # openapi_url=None       # disables OpenAPI schema (/openapi.json)
)

# 📁 Ensure 'uploads' directory exists
os.makedirs("uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Setup global logging
setup_global_logger()
# debug_log({"key": "value", "status": 200})


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup
#     print("🚀 Starting scheduler...")
#     scheduler.start()

#     # ⬇️ Add test job (every 10 seconds)
#     scheduler.add_job(
#         generate_and_send_invoices,
#         "interval",
#         seconds=10,  # Run every 10s for testing
#         id="invoice_job",
#         replace_existing=True,
#     )
#     print("✅ Test job scheduled (every 10s)")

#     yield  # 👈 Let FastAPI run

#     # Shutdown
#     print("🛑 Stopping scheduler...")
#     scheduler.shutdown()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting scheduler...")
    scheduler.start()
    print("✅ Production cron job scheduled (daily at midnight)")

    yield

    # Shutdown
    print("🛑 Stopping scheduler...")
    scheduler.shutdown()


app = FastAPI(lifespan=lifespan)


@app.get("/")
def root():
    return {"message": "Scheduler running every 1 minute"}


# error_log( "Division failed")
# Middleware to log full errors with tracebacks
@app.middleware("http")
async def log_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        logging.exception("Unhandled exception in request:")
        return JSONResponse(
            status_code=500, content={"detail": "Internal Server Error"}
        )


app.include_router(superuser_router, prefix="/super-users", tags=["Super Users"])
app.include_router(
    permission_router,
    prefix="/super-users/permissions",
    tags=["Super Users - Permissions"],
)
app.include_router(
    role_router, prefix="/super-users/roles", tags=["Super User - Roles"]
)
app.include_router(
    security_log_router,
    prefix="/super-users/security-logs",
    tags=["Super User - Security Logs"],
)

app.include_router(
    landlord_router,
    prefix="/admin/landlord-users",
    tags=["Admin - Users [landlords]"],
)

app.include_router(
    user_router,
    prefix="/admin/users",
    tags=["Admin - Users [managers,tenant-users]"],
)
app.include_router(
    property_router,
    prefix="/admin/properties",
    tags=["Admin - Properties"],
)

app.include_router(
    support_router,
    prefix="/admin/support-tickets",
    tags=["Admin - Support Tickets"],
)
app.include_router(
    invoice_router,
    prefix="/admin/invoices",
    tags=["Admin - Invoices"],
)

app.include_router(
    invoice_item_router,
    prefix="/admin/invoice-items",
    tags=["Admin - Invoice Items"],
)
app.include_router(
    manager_router,
    prefix="/admin/managers",
    tags=["Admin - Managers"],
)

app.include_router(
    property_units_router,
    prefix="/admin/property-units",
    tags=["Admin - Property Units"],
)

app.include_router(
    tenants_router,
    prefix="/admin/tenants",
    tags=["Admin - Tenants"],
)
app.include_router(
    dashboard_activity_router,
    prefix="/super-users/dashboard",
    tags=["Super Admin - Dashboard"],
)
app.include_router(
    report_router,
    prefix="/admin/reports",
    tags=["Admin - Reports"],
)
app.include_router(
    payment_router,
    prefix="/admin/payments",
    tags=["Admin - Payments"],
)


@app.post("/send-payment-email/")
async def send_payment_email(
    background_tasks: BackgroundTasks, user_email: str, name: str, amount: float
):
    """Send payment confirmation email."""
    html_content = render_template(
        "payment_created.html",
        {"name": name, "amount": f"${amount}", "status": "Created"},
    )
    background_tasks.add_task(send_email, user_email, "Payment Created", html_content)
    return {"message": "Payment email sent"}


@app.post("/send-ticket-email/")
async def send_ticket_email(
    background_tasks: BackgroundTasks, user_email: str, name: str, ticket_title: str
):
    """Send maintenance ticket created email."""
    html_content = render_template(
        "ticket_created.html",
        {"name": name, "ticket_title": ticket_title, "status": "Open"},
    )
    background_tasks.add_task(send_email, user_email, "Ticket Created", html_content)
    return {"message": "Ticket email sent"}


@app.post("/send-invoice-email/")
async def send_invoice_email(
    background_tasks: BackgroundTasks,
    user_email: str,
    name: str,
    invoice_title: str,
    due_date: str,
):
    """Send maintenance ticket created email."""
    html_content = render_template(
        "invoice_created.html",
        {
            "name": name,
            "invoice_title": invoice_title,
            "status": "Pending",
            "due_date": due_date,
        },
    )
    background_tasks.add_task(
        send_email, user_email, "New Invoice Created", html_content
    )
    return {"message": "Invoice email sent"}


# @app.get("/test-email")
# def test_email():
#     template = template_env.get_template("ticket_created.html")
#     html = template.render(
#         first_name="Rafay",
#         last_name="Asad",
#         email="layayoissuyau-8461@yopmail.com",
#         phone="123456789",
#         comment="This is a test comment.",
#         created_at="2025-07-08 12:00:00",
#         year=2025,
#     )
#     return {"html_preview": html}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://propertymanagement.urapptech.com",
        "http://localhost:3005",
        "http://localhost:3006",
    ],  # or ["*"] for development only
    allow_credentials=True,
    allow_methods=["*"],  # or ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],  # or ["Authorization", "Content-Type"]
)


@app.get("/assests/url")
def get_assets_url():
    return {"assets_url": get_file_base_url()}


# @app.get("/assests/url")
# def test_error():
#     return 1 / 0E
