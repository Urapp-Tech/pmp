import os
from fastapi import FastAPI, Request
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
from app.schedulers.invoice_scheduler import start_scheduler
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

@app.on_event("startup")
def on_startup():
    start_scheduler()

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
