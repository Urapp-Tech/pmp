from typing import Optional, List, Union
from pydantic import BaseModel, UUID4, Field
from datetime import datetime

class InvoiceItemBase(BaseModel):
    amount: Optional[str]
    currency: Optional[str]
    status: Optional[str]
    payment_date: Optional[str]
    payment_method: Optional[str]
    file: Optional[str]
    description: Optional[str]
    remarks: Optional[str]

class InvoiceBase(BaseModel):
    landlord_id: UUID4|str = Field(..., example="e8c31774-b165-43f6-9a51-a6cf3a6e57f9")
    tenant_id: Optional[UUID4] = None

    invoice_no: Optional[str] = None
    total_amount: Union[str, float, None] = None
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
    qty: Union[str, float, None] = None
    created_by: Optional[str] = "machine"
    updated_by: Optional[UUID4] = None

class Property(BaseModel):
    id: UUID4
    name: str
    supplier_code: Optional[str] = None

class PropertyUnit(BaseModel):
    id: UUID4
    name: str
    unit_no: str
    property: Optional[Property]

class User(BaseModel):
    id: UUID4
    fname: str
    lname: str
    email: str

class Tenant(BaseModel):
    contract_number: str = Field(...)
    property_unit: Optional[PropertyUnit]
    user: Optional[User]

    


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(InvoiceBase):
    pass


class InvoiceRead(InvoiceBase):
    id: UUID4
    invoice_items: Optional[List[InvoiceItemBase]] = [] 
    tenant: Optional[Tenant]  # ✅ default empty list
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes  = True

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