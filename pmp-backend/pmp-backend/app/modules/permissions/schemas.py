from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID


class ChildPermissionBase(BaseModel):
    name: str
    desc: str
    action: str
    show_on_menu: bool


class ChildPermissionCreate(ChildPermissionBase):
    pass


class PermissionBase(BaseModel):
    name: str
    desc: str
    permission_type: str


class PermissionCreate(PermissionBase):
    data: List[ChildPermissionCreate] = []


class PermissionUpdate(PermissionCreate):
    pass


class ChildPermissionOut(BaseModel):
    id: UUID
    name: str
    desc: str
    action: Optional[str] = None
    permission_sequence: Optional[int] = None
    permission_parent: Optional[UUID] = None
    show_on_menu: bool
    is_active: bool

    class Config:
        from_attributes = True


class PermissionOut(PermissionBase):
    id: UUID
    data: List[ChildPermissionOut] = []

    class Config:
        from_attributes = True
