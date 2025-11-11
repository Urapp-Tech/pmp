from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from typing import List


class SecurityLogCreate(BaseModel):
    action: str
    description: str
    ip_address: str
    user_agent: str


class SecurityLogOut(BaseModel):
    id: UUID
    user_id: Optional[UUID] = Field(..., alias="userId")
    user_name: Optional[str] = Field(..., alias="userName")
    action: str
    description: Optional[str]
    ip_address: Optional[str] = Field(..., alias="ipAddress")
    user_agent: Optional[str] = Field(..., alias="userAgent")
    created_at: datetime = Field(..., alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True
        alias_generator = None


class SecurityLogListResponse(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: List[SecurityLogOut]
