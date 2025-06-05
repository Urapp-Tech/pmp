from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.users.routes import router as user_router
from app.modules.permissions.routes import router as permission_router
from app.modules.roles.routes import router as role_router

app = FastAPI()

app.include_router(user_router, prefix="/super-users/users", tags=["Super Users"])
app.include_router(
    permission_router,
    prefix="/super-users/permissions",
    tags=["Super Users - Permissions"],
)
app.include_router(
    role_router, prefix="/super-users/roles", tags=["Super User - Roles"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3005"],  # or ["*"] for development only
    allow_credentials=True,
    allow_methods=["*"],  # or ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],  # or ["Authorization", "Content-Type"]
)
