from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
import re


class LandlordCreate(BaseModel):
    fname: str = Field(..., min_length=1, description="First name (only alphabets)")
    lname: str = Field(..., min_length=1, description="Last name (only alphabets)")
    email: EmailStr
    password: str
    phone: str
    is_landlord: bool = True

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


class LandlordOut(BaseModel):
    id: UUID
    fname: str
    lname: str
    email: EmailStr
    phone: str
    is_landlord: bool = Field(..., alias="isLandlord")
    landlord_id: Optional[UUID] = Field(None, alias="landlordId")
    profile_pic: Optional[str] = Field(None, alias="profilePic")
    gender: Optional[str]
    is_active: bool = Field(..., alias="isActive")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
        alias_generator = None


class PaginatedLandlordResponse(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: list[LandlordOut]

    class Config:
        from_attributes = True
        alias_generator = None
        populate_by_name = True


class VerifyLandlordRequest(BaseModel):
    user_id: UUID = Field(..., alias="userId")
    is_verified: bool = Field(..., alias="isVerified")
