from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID


class UserLogin(BaseModel):
    email: str = Field(..., description="Email address or phone number")
    password: str


class SuperAdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role_id: Optional[UUID] = Field(None, alias="roleId")  # None => root Super Admin
    is_active: Optional[bool] = True

    class Config:
        populate_by_name = True


class SuperAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    role_id: Optional[UUID] = Field(None, alias="roleId")  # can move to/from sub role
    is_active: Optional[bool] = None

    class Config:
        populate_by_name = True


class PermissionMiniOut(BaseModel):
    id: UUID
    name: str
    action: Optional[str] = None
    show_on_menu: bool = False


class RoleWithPermissionsOut(BaseModel):
    id: Optional[UUID] = Field(None, alias="id")  # root => null
    name: str
    permissions: List[PermissionMiniOut] = []


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool

    # name fields
    name: Optional[str] = None
    fname: Optional[str] = None
    lname: Optional[str] = None

    # legacy role info
    role_id: Optional[UUID] = Field(None, alias="roleId")
    role_name: Optional[str] = Field(None, alias="roleName")

    # NEW: role object in data
    role: Optional[RoleWithPermissionsOut] = None

    # tokens
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"  # NEW: moved inside data

    class Config:
        from_attributes = True
        populate_by_name = True


class SuperAdminListOut(BaseModel):
    items: List[UserOut]
    page: int
    pageSize: int
    total: int
    totalPages: int
    success: bool = True


class SuperAdminItemOut(BaseModel):
    items: UserOut
    success: bool = True
    message: Optional[str] = None


class LoginResponse(BaseModel):
    data: UserOut
    success: bool
    message: str


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str
