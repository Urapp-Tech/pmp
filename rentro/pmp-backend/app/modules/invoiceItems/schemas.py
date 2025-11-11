from typing import List, Optional, Union
from fastapi import UploadFile
from pydantic import ConfigDict, BaseModel, Field
from datetime import datetime
from uuid import UUID   # this is fine since used for typing


class InvoiceItemBase(BaseModel):
    amount: Optional[str]
    currency: Optional[str]
    status: Optional[str]
    payment_date: Optional[str]
    payment_method: Optional[str]
    file: Optional[Union[UploadFile, str]]
    description: Optional[str]
    remarks: Optional[str]


class InvoiceItemCreate(InvoiceItemBase):
    invoice_id: UUID
    pass  # invoice_id is removed or handled elsewhere


class InvoiceItemUpdate(InvoiceItemBase):
    pass


class InvoiceItemActionPayload(BaseModel):
    remarks: str
    user_id: UUID


class InvoiceItemOut(InvoiceItemBase):
    id: UUID
    invoice_id: Optional[UUID]
    updated_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    # model_config = ConfigDict(from_attributes=True)


class InvoiceItemResponse(BaseModel):
    success: bool
    message: str
    items: Optional[InvoiceItemOut] = None


class PaginatedInvoiceItemResponse(BaseModel):
    success: bool
    message: str
    total: int
    page: int
    size: int
    items: List[InvoiceItemOut]
