from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.modules.permissions.schemas import (
    # Permission,
    PermissionOut,
    PermissionCreate,
    PermissionUpdate,
)
from app.modules.permissions.services import create_permission, update_permission

# router = APIRouter(prefix="/permissions", tags=["permissions"])
router = APIRouter()
# @router.post("/", response_model=PermissionOut, status_code=status.HTTP_201_CREATED)
# def create_new_permission(permission: Permission, db: Session = Depends(get_db)):
#     return create_permission(db, permission)


@router.post("/create", response_model=PermissionOut)
def create_with_transaction(
    permission: PermissionCreate, db: Session = Depends(get_db)
):
    return create_permission(db, permission)


@router.put("/update/{id}", response_model=PermissionOut)
def update_permission_route(
    id: UUID, permission: PermissionUpdate, db: Session = Depends(get_db)
):
    return update_permission(db, id, permission)
