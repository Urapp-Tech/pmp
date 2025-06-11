from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    gender: str


class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    gender: str
    phone: Optional[str] = None
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
