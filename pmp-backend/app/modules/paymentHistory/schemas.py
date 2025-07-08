from pydantic import BaseModel
from uuid import UUID
from enum import Enum


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class CreatePaymentRequest(BaseModel):
    user_id: UUID
    invoice_id: UUID
    property_unit_id: UUID
    property: str
    property_unit: str
    user_email: str
    # user_phone: str
    user_name: str
    amount: float
    # payment_type: str


class PaymentResponse(BaseModel):
    payment_url: str
    invoice_id: UUID
    status: PaymentStatus
