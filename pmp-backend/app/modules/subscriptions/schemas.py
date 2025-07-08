from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class SubscriptionCreate(BaseModel):
    plan_name: str
    description: Optional[str] = None
    amount: float
    currency: str = "KWD"
    duration_in_days: int


class SubscriptionOut(BaseModel):
    id: UUID
    plan_name: str
    description: Optional[str] = None
    amount: float
    currency: str
    duration_in_days: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
