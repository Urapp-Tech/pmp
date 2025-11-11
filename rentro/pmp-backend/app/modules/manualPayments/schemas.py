from typing import Optional, Any, Dict, List, Union
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

try:
    # Pydantic v2
    from pydantic import ConfigDict

    _V2 = True
except Exception:  # pragma: no cover
    _V2 = False


# ---------- Shared subtypes ----------


class AttachmentOut(BaseModel):
    url: str
    mime: Optional[str] = None
    name: Optional[str] = None
    size: Optional[int] = None  # bytes (or change to float if you store differently)


class DocsOut(BaseModel):
    attachments: List[AttachmentOut] = []


# ---------- Create / Update payloads ----------


class ManualPaymentCreate(BaseModel):
    invoice_id: UUID
    amount: float
    currency: str = "KWD"
    method: Optional[str] = None
    deposit_reference: Optional[str] = None
    deposit_date: Optional[datetime] = None
    notes: Optional[str] = None
    # Accept either validated DocsOut or raw dict (stays flexible with DB JSON)
    docs: Optional[Union[DocsOut, Dict[str, Any]]] = None
    mark_as_paid: bool = False


class ManualPaymentUpdate(BaseModel):
    invoice_id: Optional[UUID] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    method: Optional[str] = None
    deposit_reference: Optional[str] = None
    deposit_date: Optional[datetime] = None
    notes: Optional[str] = None
    docs: Optional[Union[DocsOut, Dict[str, Any]]] = None
    mark_as_paid: Optional[bool] = None


# ---------- Output models ----------


class ManualPaymentOut(BaseModel):
    id: UUID
    invoice_id: Optional[UUID] = None
    landlord_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    amount: float
    currency: str
    method: Optional[str] = None
    deposit_reference: Optional[str] = None
    deposit_date: Optional[datetime] = None
    notes: Optional[str] = None
    # If your DB stores json, both DocsOut and dict are acceptable to avoid strict failures
    docs: Optional[Union[DocsOut, Dict[str, Any]]] = None
    submitted_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    invoice_no: Optional[str] = None
    landlord_name: Optional[str] = None

    if _V2:
        model_config = ConfigDict(from_attributes=True)
    else:  # Pydantic v1 fallback

        class Config:
            orm_mode = True


class ManualPaymentResponse(BaseModel):
    """
    Optional single-item envelope for detail/create/update endpoints.
    Use this ONLY if your route returns a single 'item' with success/message.
    """

    item: ManualPaymentOut
    success: bool = True
    message: Optional[str] = None


class ManualPaymentListResponse(BaseModel):
    items: List[ManualPaymentOut]
    page: int
    pageSize: int
    total: int
    totalPages: int
    success: bool


class ManualPaymentUpdateResponse(BaseModel):
    items: ManualPaymentOut
    success: bool = True
    msg: Optional[str] = None


# ---------- LOV (unchanged) ----------


class LovItem(BaseModel):
    id: UUID
    name: str


class LovResponse(BaseModel):
    items: List[LovItem]
    success: bool
