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
    # password: str
    phone: Optional[str] = None
    gender: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: UserOut
    access_token: str
    refresh_token: str


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str
