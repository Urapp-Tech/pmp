from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class AttachmentOut(BaseModel):
    url: str
    mime: Optional[str] = None
    name: Optional[str] = None
    size: Optional[int] = None


class CollectionTotals(BaseModel):
    total_collection: int  # count of paid+auto invoices
    received_amount: float  # sum(paid_amount) for paid+manual
    pending_amount: float  # sum(due_amount) for paid+auto


class CollectionRowOut(BaseModel):
    invoice_id: UUID
    invoice_no: Optional[str] = None
    property_name: Optional[str] = None
    unit_no: Optional[str] = None
    tenant_name: Optional[str] = None
    payment_date: Optional[datetime] = None
    rent: float  # invoice.total_amount
    status: str  # "Pending" | "Received"
    attachments: List[AttachmentOut] = []


class CollectionsListResponse(BaseModel):
    items: List[CollectionRowOut]
    page: int
    pageSize: int
    total: int
    totalPages: int
    success: bool
    totals: CollectionTotals
