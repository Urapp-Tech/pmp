from fastapi import APIRouter, Depends
from uuid import UUID
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.modules.roles.schemas import (
    RoleCreate,
    RoleUpdate,
    RoleOut,
    RoleUpdateResponse,
)
from app.modules.roles.services import create_role, update_role

router = APIRouter()


@router.post("/create", response_model=RoleOut)
def create_new_role(role: RoleCreate, db: Session = Depends(get_db)):
    return create_role(db, role)


@router.put("/update/{id}", response_model=RoleUpdateResponse)
def update_role_route(id: UUID, permission: RoleUpdate, db: Session = Depends(get_db)):
    return update_role(db, id, permission)
