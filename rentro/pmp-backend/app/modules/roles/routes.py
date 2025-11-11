from fastapi import APIRouter, Depends, Query, Path
from uuid import UUID
from sqlalchemy.orm import Session
from app.db.database import get_db
from typing import Optional, List
from app.modules.roles.schemas import (
    RoleCreate,
    RoleUpdate,
    RoleCreateResponse,
    RoleUpdateResponse,
    RoleListResponse,
    RoleLOV,
    RoleDeleteResponse,
)
from app.modules.roles.services import (
    create_role,
    update_role,
    get_roles,
    get_role_lov,
    delete_role,
)

router = APIRouter()


@router.get("/list", response_model=RoleListResponse)
def read_roles(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_roles(db=db, page=page, size=size, search=search)


@router.post("/create", response_model=RoleCreateResponse)
def create_new_role(role: RoleCreate, db: Session = Depends(get_db)):
    return create_role(db, role)


@router.post("/update/{id}", response_model=RoleUpdateResponse)
def update_role_route(id: UUID, permission: RoleUpdate, db: Session = Depends(get_db)):
    return update_role(db, id, permission)


@router.get("/lov", response_model=List[RoleLOV])
def role_lov(db: Session = Depends(get_db)):
    return get_role_lov(db)


@router.post("/delete/{id}", response_model=RoleDeleteResponse)
def delete_landlord(
    id: UUID = Path(..., description="Role ID"), db: Session = Depends(get_db)
):
    return delete_role(db, id)
