from pydantic import BaseModel, Field,EmailStr
from typing import List, Optional
from uuid import UUID


# --- Input Model ---
class ContactUsCreate(BaseModel):
    fname: str = Field(..., example="John")
    lname: str = Field(..., example="Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    phone: Optional[str] = Field(None, example="123-456-7890")
    message: Optional[str] = Field(None, example="Hello, this is a test message.")


# --- Output (Read) Model ---
class ContactUsRead(BaseModel):
    id: UUID
    fname: str
    lname: str
    email: EmailStr
    phone: Optional[str]
    message: Optional[str]

    class Config:
        from_attributes = True   # SQLAlchemy objects se return karne ke liye


class ContactUsCreateResponse(BaseModel):
    message: str
    success: bool
    items: List[ContactUsRead]



class ContactUsListResponse(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: List[ContactUsRead]
