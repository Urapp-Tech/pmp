from pydantic import BaseModel, EmailStr, Field, field_validator
from app.modules.roles.schemas import RoleOutForUserLoggedIn
from typing import Optional, List, Union
from uuid import UUID
from datetime import datetime
import re
from fastapi import UploadFile


class UserLogin(BaseModel):
    email: str = Field(..., description="Email address or phone number")
    password: str


class UserCreate(BaseModel):
    fname: str = Field(..., min_length=1, description="First name (only alphabets)")
    lname: str = Field(..., min_length=1, description="Last name (only alphabets)")
    email: EmailStr
    password: str
    phone: str
    gender: str = None
    landlord_id: Optional[UUID] = Field(None, alias="landlordId")
    role_type: str = Field(None, alias="roleType")

    class Config:
        populate_by_name = True

    @field_validator("fname", "lname")
    def name_must_be_alphabets(cls, v, field):
        if not v.isalpha():
            raise ValueError(
                f"{field.name.replace('_', ' ').capitalize()} must contain only alphabets."
            )
        return v

    @field_validator("phone")
    def phone_must_be_valid(cls, v):
        if not re.fullmatch(r"^[9654]\d{7}$", v):
            raise ValueError(
                "Phone number must start with 9, 6, 5, or 4 and be exactly 8 digits long."
            )
        return v

    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must include at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must include at least one special character.")
        return v


class UserUpdate(BaseModel):
    fname: Optional[str] = Field(
        None, min_length=1, description="First name (only alphabets)"
    )
    lname: Optional[str] = Field(
        None, min_length=1, description="Last name (only alphabets)"
    )
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    landlord_id: Optional[UUID] = Field(None, alias="landlordId")
    role_type: Optional[str] = Field(None, alias="roleType")

    class Config:
        populate_by_name = True

    @field_validator("fname", "lname")
    def name_must_be_alphabets(cls, v, field):
        if v is not None and not v.isalpha():
            raise ValueError(
                f"{field.name.replace('_', ' ').capitalize()} must contain only alphabets."
            )
        return v

    @field_validator("phone")
    def phone_must_be_valid(cls, v):
        if v is not None and not re.fullmatch(r"^[9654]\d{7}$", v):
            raise ValueError(
                "Phone number must start with 9, 6, 5, or 4 and be exactly 8 digits long."
            )
        return v

    @field_validator("password")
    def password_strength(cls, v):
        if not v:
            return v
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must include at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must include at least one special character.")
        return v


class AssignedUnit(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: UUID
    fname: str
    lname: str
    email: EmailStr
    phone: str
    is_landlord: bool = Field(..., alias="isLandlord")
    landlord_id: Optional[UUID] = Field(None, alias="landlordId")
    role_id: Optional[UUID] = Field(None, alias="roleId")
    role_name: Optional[str] = Field(None, alias="roleName")
    profile_pic: Optional[str] = Field(None, alias="profilePic")
    gender: Optional[str]
    is_active: bool = Field(..., alias="isActive")
    is_verified: bool = Field(..., alias="isVerified")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
        alias_generator = None


class AssignedUser(BaseModel):
    id: UUID
    name: str
    profilePic: Optional[str] = None


class ManagerUserOut(BaseModel):
    id: UUID
    fname: str
    lname: str
    email: EmailStr
    phone: str
    is_landlord: bool = Field(..., alias="isLandlord")
    landlord_id: Optional[UUID] = Field(None, alias="landlordId")
    role_id: Optional[UUID] = Field(None, alias="roleId")
    role_name: Optional[str] = Field(None, alias="roleName")
    profile_pic: Optional[str] = Field(None, alias="profilePic")
    gender: Optional[str]
    is_active: bool = Field(..., alias="isActive")
    is_verified: bool = Field(..., alias="isVerified")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    assigned_units: Optional[List[AssignedUnit]] = Field(
        default=None, alias="assignedUnits"
    )

    class Config:
        from_attributes = True
        populate_by_name = True
        alias_generator = None


class TenantUserOut(BaseModel):
    id: UUID
    fname: str
    lname: str
    email: EmailStr
    phone: str
    is_landlord: bool = Field(..., alias="isLandlord")
    landlord_id: Optional[UUID] = Field(None, alias="landlordId")
    role_id: Optional[UUID] = Field(None, alias="roleId")
    role_name: Optional[str] = Field(None, alias="roleName")
    profile_pic: Optional[str] = Field(None, alias="profilePic")
    gender: Optional[str]
    is_active: bool = Field(..., alias="isActive")
    is_verified: bool = Field(..., alias="isVerified")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
        alias_generator = None


class UserResponseOut(BaseModel):
    items: UserOut
    message: str
    success: bool

    class Config:
        from_attributes = True


class UserLoggedInOut(BaseModel):
    id: UUID
    fname: str
    lname: str
    email: EmailStr
    phone: str
    gender: Optional[str]
    is_landlord: bool = Field(..., alias="isLandlord")
    landlord_id: Optional[UUID] = Field(None, alias="landlordId")
    # role_id: Optional[UUID] = Field(None, alias="roleId")
    # role_name: Optional[str] = Field(None, alias="roleName")
    role: Optional[RoleOutForUserLoggedIn]
    profile_pic: Optional[str] = Field(None, alias="profilePic")
    is_active: bool = Field(..., alias="isActive")
    is_verified: bool = Field(..., alias="isVerified")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        alias_generator = None


class PaginatedManagerUserResponse(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: List[ManagerUserOut]

    class Config:
        from_attributes = True
        populate_by_name = True


class PaginatedTenantUserResponse(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: list[TenantUserOut]

    class Config:
        from_attributes = True
        alias_generator = None
        populate_by_name = True


class UserLOV(BaseModel):
    id: UUID
    name: str


class LoginResponse(BaseModel):
    data: UserLoggedInOut
    success: bool
    message: str


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str
