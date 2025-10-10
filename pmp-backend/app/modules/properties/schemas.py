from pydantic import UUID4, BaseModel, Field, field_validator
from typing import Optional, List, Union, Any
from fastapi import UploadFile
from uuid import UUID
from datetime import datetime,date
from enum import Enum
import json


# 🔸 Enum for property type
class PropertyTypeEnum(str, Enum):
    residential = "residential"
    commercial = "commercial"

class PaymentCycle(str, Enum):
    monthly = "Monthly"
    quarterly = "Quarterly"
    yearly = "Yearly"
class UserDetailOut(BaseModel):
    id: UUID
    fname: str
    lname: str
    email: str
    phone: str
    gender: Optional[str] = None
    profile_pic: Optional[str] = Field(None, alias="profilePic")

    class Config:
        from_attributes = True
        populate_by_name = True
# ---------------------------
# 🏢 Property Unit Schemas
# ---------------------------
class ContractOut(BaseModel):
    id: UUID
    user_id: UUID = Field(..., alias="userId")
    property_unit_id: Optional[UUID] = Field(None, alias="propertyUnitId")
    contract_start: date = Field(..., alias="contractStart")
    contract_end: date = Field(..., alias="contractEnd")
    contract_number: str = Field(..., alias="contractNumber")
    rent_price: float = Field(..., alias="rentPrice")
    rent_pay_day: int = Field(..., alias="rentPayDay")
    payment_cycle: PaymentCycle = Field(..., alias="paymentCycle")
    leaving_date: Optional[date] = Field(None, alias="leavingDate")
    civil_id: Optional[str] = Field(None, alias="civilId")
    tenant_type: Optional[str] = Field(None, alias="tenantType")
    nationality: Optional[str]
    legal_case: Optional[bool] = Field(..., alias="legalCase")
    language: Optional[str]
    is_active: bool = Field(..., alias="isActive")
    is_approved: bool = Field(..., alias="isApproved")
    agreement_doc: Optional[List[str]] = None
    user: Optional[UserDetailOut] = Field(None, alias="userDetail")
    @field_validator("agreement_doc", mode="before")
    @classmethod
    def _normalize_agreement_doc(cls, v):
        if v in (None, "", []):
            return None
        if isinstance(v, list):
            return [str(x) for x in v]
        if isinstance(v, str):
            # Try JSON array first: '["a","b"]'
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(x) for x in parsed]
            except Exception:
                pass
            # Otherwise treat single string path as one-item list
            return [v]
        # Fallback: make it a single string and wrap
        return [str(v)]

    # make sure ORM conversion/aliases work
    model_config = {"from_attributes": True, "populate_by_name": True}


class PropertyUnitBase(BaseModel):
    name: Optional[str] = Field(None, example="Unit A")
    unit_no: Optional[str] = Field(None, example="101")
    unit_type: Optional[str] = Field(None, example="2BHK")
    size: Optional[str] = Field(None, example="1200 sqft")
    rent: Optional[str] = Field(None, example="500 KD")
    description: Optional[str] = Field(None, example="Spacious with balcony")
    pictures: Optional[List[Union[UploadFile, str]]] = Field(
        default_factory=list, example=["url1", "url2"]
    )
    bedrooms: Optional[str] = Field(None, example="2")
    bathrooms: Optional[str] = Field(None, example="2")
    water_meter: Optional[str] = Field(None, example="WM123456")
    electricity_meter: Optional[str] = Field(None, example="EM123456")
    status: Optional[str] = Field(None, example="available")
    is_active: Optional[bool] = Field(None)


class PropertyUnitCreate(PropertyUnitBase):
    id: Optional[UUID] = None
    property_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    pass


class PropertyUnitUpdate(PropertyUnitBase):

    id: Optional[UUID] = None
    property_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    pass


class PropertyUnitOut(PropertyUnitBase):
    id: UUID4
    property_id: UUID4
    created_at: datetime
    updated_at: datetime
    # in PropertyUnitOut:
    contractDetails: Optional[ContractOut] = None

    class Config:
        from_attributes = True


# ---------------------------
# 🏠 Property Schemas
# ---------------------------


class PropertyBase(BaseModel):
    name: Optional[str] = Field(None, example="Sunrise Apartment")
    city: Optional[str] = Field(None, example="Kuwait City")
    governance: Optional[str] = Field(None, example="Hawalli")
    address: Optional[str] = Field(None, example="Block 3, Street 4")
    address2: Optional[str] = Field(None, example="Near Mosque")
    description: Optional[str] = Field(None, example="Luxury residential building")
    pictures: Optional[List[Union[UploadFile, str]]] = Field(
        default_factory=list, example=["url1", "url2"]
    )
    property_type: Optional[str] = Field(None, example="Apartment")
    type: Optional[PropertyTypeEnum] = Field(None, example="residential")
    paci_no: Optional[str] = Field(None, example="123456")
    property_no: Optional[str] = Field(None, example="PROP-789")
    civil_no: Optional[str] = Field(None, example="CIVIL123")
    build_year: Optional[str] = Field(None, example="2005")
    book_value: Optional[str] = Field(None, example="300000")
    estimate_value: Optional[str] = Field(None, example="350000")
    latitude: Optional[str] = Field(None, example="29.3759")
    longitude: Optional[str] = Field(None, example="47.9774")
    status: Optional[str] = Field(None, example="active")
    is_active: Optional[bool] = Field(None, example="true")
    unit_counts: Optional[int] = Field(None, example=12)
    email: Optional[str] = Field(None, example="f0HsS@example.com")
    phone: Optional[str] = Field(None, example="+965 1234 5678")
    supplier_code: Optional[str] = Field(None, example="SUP12345")
    bank_name: Optional[str] = Field(None, example="Gulf Bank")
    account_no: Optional[str] = Field(None, example="GB123456789")
    iban_no: Optional[str] = Field(None, example="IBN123456789")
    account_name: Optional[str] = Field(None, example="Sunrise Property Ltd.")


class PropertyCreate(PropertyBase):
    landlord_id: UUID = Field(..., example="e8c31774-b165-43f6-9a51-a6cf3a6e57f9")
    units: Optional[List[PropertyUnitCreate]] = Field(default_factory=list)


class PropertyUpdate(PropertyBase):
    units: Optional[List[PropertyUnitCreate]] = Field(default_factory=list)


class PropertyOut(PropertyBase):
    id: UUID4 | str = Field(..., example="3fa85f64-5717-4562-b3fc-2c963f66afa6")
    landlord_id: UUID4 | str = Field(
        ..., example="e8c31774-b165-43f6-9a51-a6cf3a6e57f9"
    )
    landlord_name: Optional[str] = Field(None, example="John Doe")
    assignedManagerName: Optional[str] = Field(None, example="Monkey D luffy")
    units: List[PropertyUnitOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedPropertyOut(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: List[PropertyOut]


class PaginatedPropertyUnitOut(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: List[PropertyUnitOut]
