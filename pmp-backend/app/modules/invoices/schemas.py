from typing import Optional, List
from pydantic import BaseModel, UUID4, Field
from datetime import datetime


class InvoiceBase(BaseModel):
    landlord_id: UUID4|str = Field(..., example="e8c31774-b165-43f6-9a51-a6cf3a6e57f9")
    tenant_id: Optional[UUID4] = None

    # invoice_no: Optional[str] = None
    total_amount: Optional[str] = None
    paid_amount: Optional[str] = None
    discount_amount: Optional[str] = None
    due_amount: Optional[str] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    payment_date: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    qty: Optional[str] = None
    created_by: Optional[str] = "machine"
    updated_by: Optional[UUID4] = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(InvoiceBase):
    pass


class InvoiceRead(InvoiceBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class InvoiceResponse(BaseModel):
    success: bool
    message: str
    items: Optional[InvoiceRead]


class PaginatedInvoiceResponse(BaseModel):
    success: bool
    message: str
    total: int
    page: int
    size: int
    items: List[InvoiceRead]