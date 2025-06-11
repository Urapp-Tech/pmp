# schemas/roles.py
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class RolePermissionItem(BaseModel):
    id: UUID
    status: bool


class RoleCreate(BaseModel):
    name: str
    desc: Optional[str] = None
    data: List[RolePermissionItem]


class RoleUpdate(RoleCreate):
    pass


class RoleOut(BaseModel):
    id: UUID
    name: str
    desc: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class RoleUpdateResponse(BaseModel):
    role: RoleOut
    message: str
