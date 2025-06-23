# schemas/roles.py
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from app.modules.permissions.schemas import ChildPermissionOutForLoggedIn


class RolePermissionItem(BaseModel):
    id: UUID
    status: bool


class RoleCreate(BaseModel):
    name: str
    # desc: Optional[str] = None
    data: List[UUID]


class RoleUpdate(BaseModel):
    name: str
    # desc: Optional[str]
    data: List[UUID]


class RolePermissionOut(BaseModel):
    id: UUID

    class Config:
        from_attributes = True


class RoleOut(BaseModel):
    id: UUID
    name: str
    desc: Optional[str] = None
    is_active: bool = Field(..., alias="isActive")
    permissions: List[UUID] = []

    class Config:
        from_attributes = True
        alias_generator = None
        populate_by_name = True


class RoleCreateResponse(BaseModel):
    role: RoleOut
    message: str
    success: bool


class RoleUpdateResponse(BaseModel):
    role: RoleOut
    message: str
    success: bool


class RoleListResponse(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: List[RoleOut]


class RoleLOV(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class RoleDeleteResponse(BaseModel):
    success: bool
    message: str


class RoleOutForUserLoggedIn(BaseModel):
    id: UUID
    name: str
    permissions: List[ChildPermissionOutForLoggedIn] = []

    class Config:
        from_attributes = True
        alias_generator = None
        populate_by_name = True
