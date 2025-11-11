from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.db.database import get_db
from app.modules.superusers.schemas import (
    UserLogin,
    LoginResponse,
    TokenSchema,
    TokenRefreshRequest,
    UserOut,
    SuperAdminCreate,
    SuperAdminUpdate,
    SuperAdminListOut,
    SuperAdminItemOut,
)
from app.modules.superusers.services import (
    create_superadmin,
    update_superadmin,
    list_sub_superadmins,
    authenticate_user,
    refresh_access_token,
)

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(user: UserLogin, db: Session = Depends(get_db), request: Request = None):
    return authenticate_user(db, user, request)


@router.post("/refresh/token", response_model=TokenSchema)
def refresh_token(request: TokenRefreshRequest):
    return refresh_access_token(request.refresh_token)


# Create Super Admin (root if roleId omitted; sub-superadmin if roleId provided)
@router.post(
    "/create",
    response_model=SuperAdminItemOut,
    summary="Create superadmin or sub-superadmin",
)
def create(user: SuperAdminCreate, db: Session = Depends(get_db)):
    return create_superadmin(db, user)


# Update Super Admin (including moving to/from sub-superadmin via roleId)
@router.post("/update/{superadmin_id}", response_model=SuperAdminItemOut)
def update(
    superadmin_id: UUID, payload: SuperAdminUpdate, db: Session = Depends(get_db)
):
    # service already returns: { "items": UserOut, "success": True, "message": "..." }
    return update_superadmin(db, superadmin_id, payload)


@router.get("/list", response_model=SuperAdminListOut)
def read(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=200),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return list_sub_superadmins(db, page=page, page_size=pageSize, q=q)
