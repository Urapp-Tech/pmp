from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.superusers.routes import router as superuser_router
from app.modules.users.routes import router as user_router
from app.modules.permissions.routes import router as permission_router
from app.modules.roles.routes import router as role_router
from app.modules.securityLogs.routes import router as security_log_router
from app.modules.landlords.routes import router as landlord_router
from app.modules.supportTickets.routes import router as support_router

# app = FastAPI()
app = FastAPI(
    docs_url="/docs",  # disables Swagger UI (/docs)
    # openapi_url=None       # disables OpenAPI schema (/openapi.json)
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
    support_router,
    prefix="/admin/support-tickets",
    tags=["Admin - Support Tickets"],
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3005",
        "http://localhost:3006",
    ],  # or ["*"] for development only
    allow_credentials=True,
    allow_methods=["*"],  # or ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],  # or ["Authorization", "Content-Type"]
)
