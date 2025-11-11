from __future__ import annotations
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal


# ---------- helpers ----------
def _dec(v) -> Decimal:
    if v is None:
        return Decimal("0")
    if isinstance(v, (int, float, Decimal)):
        return Decimal(str(v))
    return Decimal(str(v).replace(",", "").strip())


# =========================
# Subscriptions (CRUD)
# =========================


class SubscriptionCreate(BaseModel):
    plan_name: str
    description: Optional[str] = None
    amount: Decimal
    currency: str = "KWD"
    duration_in_days: int

    _fix_amount = validator("amount", pre=True, allow_reuse=True)(_dec)


class SubscriptionUpdate(BaseModel):
    plan_name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    duration_in_days: Optional[int] = Field(None, ge=1)

    _fix_amount = validator("amount", pre=True, allow_reuse=True)(_dec)


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


# =========================
# Subscribed Landlords
# =========================


class LandlordSubscribeRequest(BaseModel):
    subscription_id: UUID
    holding_properties: int = Field(..., ge=0)


class SubscribedLandlordOut(BaseModel):
    id: UUID
    landlord_id: UUID
    subscription_id: UUID
    plan_name: Optional[str] = None
    holding_properties: int
    total_amount: Decimal
    discounted_amount: Decimal
    due_amount: Decimal
    status: str  # pending|approved|rejected
    approved_by: Optional[UUID] = None
    expiration_date: Optional[datetime] = None
    payment_link: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class AdminApproveRequest(BaseModel):
    discounted_amount: Decimal = Field(0)
    expiration_date: Optional[datetime] = None  # if omitted, compute from plan
    _fix = validator("discounted_amount", pre=True, allow_reuse=True)(_dec)


class AdminRejectRequest(BaseModel):
    reason: Optional[str] = None


class AdminUpdateRequest(BaseModel):
    holding_properties: Optional[int] = Field(None, ge=0)
    total_amount: Optional[Decimal] = None
    discounted_amount: Optional[Decimal] = None
    due_amount: Optional[Decimal] = None
    _f1 = validator("total_amount", pre=True, allow_reuse=True)(_dec)
    _f2 = validator("discounted_amount", pre=True, allow_reuse=True)(_dec)
    _f3 = validator("due_amount", pre=True, allow_reuse=True)(_dec)


class RenewalPaidRequest(BaseModel):
    # called after successful renewal (webhook/callback)
    extend_days: Optional[int] = None  # if omitted, uses plan.duration_in_days


class CancelRequest(BaseModel):
    reason: Optional[str] = None
