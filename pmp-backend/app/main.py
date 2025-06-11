from fastapi import FastAPI
from app.modules.users.routes import router as user_router
from app.modules.permissions.routes import router as permission_router
from app.modules.roles.routes import router as role_router

# app = FastAPI()
app = FastAPI(
    docs_url='/docs',         # disables Swagger UI (/docs)
    # openapi_url=None       # disables OpenAPI schema (/openapi.json)
)

app.include_router(user_router, prefix="/super-users/users", tags=["Super Users"])
app.include_router(
    permission_router,
    prefix="/super-users/permissions",
    tags=["Super Users - Permissions"],
)
app.include_router(
    role_router, prefix="/super-users/roles", tags=["Super User - Roles"]
)
