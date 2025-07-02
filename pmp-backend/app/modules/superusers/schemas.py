from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID


class UserLogin(BaseModel):
    email: str = Field(..., description="Email address or phone number")
    password: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    # gender: str


class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role_id: UUID = Field(None, alias="roleId")
    role_name: str = Field(None, alias="roleName")
    phone: Optional[str] = None
    # gender: str
    # password: str

    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    data: UserOut
    # access_token: str
    # refresh_token: str
    success: bool
    message: str


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str
