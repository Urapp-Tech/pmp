from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime
from enum import Enum


class PaymentCycle(str, Enum):
    monthly = "Monthly"
    quarterly = "Quarterly"
    yearly = "Yearly"


class ContractCreate(BaseModel):
    user_id: UUID = Field(..., alias="userId")
    property_unit_id: UUID = Field(..., alias="propertyUnitId")
    contract_start: date = Field(..., alias="contractStart")
    contract_end: date = Field(..., alias="contractEnd")
    rent_price: float = Field(..., alias="rentPrice")
    rent_pay_day: int = Field(..., alias="rentPayDay")
    payment_cycle: PaymentCycle = Field(..., alias="paymentCycle")
    leaving_date: Optional[date] = Field(None, alias="leavingDate")
    civil_id: Optional[str] = Field(None, alias="civilId")
    tenant_type: Optional[str] = Field(None, alias="tenantType")
    nationality: Optional[str]
    legal_case: Optional[bool] = Field(False, alias="legalCase")
    is_approved: Optional[bool] = Field(False, alias="isApproved")
    language: Optional[str]

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "userId": "a1b2c3d4-5678-9012-3456-7890abcdef12",
                    "propertyUnitId": "a1b2c3d4-5678-9012-3456-7890abcdef12",
                    "contractStart": "2025-07-01",
                    "contractEnd": "2026-06-30",
                    "rentPrice": 1200.50,
                    "rentPayDay": 5,
                    "paymentCycle": "Monthly",
                    "leavingDate": None,
                    "civilId": "123456789",
                    "tenantType": "individual",
                    "nationality": "Pakistani",
                    "legalCase": False,
                    "isApproved": False,
                    "language": "English",
                }
            ]
        },
    )


class ContractCreateOut(BaseModel):
    id: UUID
    user_id: UUID = Field(..., alias="userId")
    property_unit_id: UUID = Field(..., alias="propertyUnitId")
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
    legal_case: Optional[bool] = Field(False, alias="legalCase")
    language: Optional[str]
    agreement_doc: Optional[str] = (Field(None, alias="agreementDoc"),)
    is_active: bool = Field(..., alias="isActive")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "f12a4fa1-e007-4b76-b654-e09c77b57d2f",
                "userId": "a1b2c3d4-5678-9012-3456-7890abcdef12",
                "propertyUnitId": "a1b2c3d4-5678-9012-3456-7890abcdef12",
                "contractStart": "2025-07-01",
                "contractEnd": "2026-06-30",
                "contractNumber": "CNT-2025-001",
                "rentPrice": 1200.50,
                "rentPayDay": 5,
                "paymentCycle": "Monthly",
                "leavingDate": None,
                "civilId": "123456789",
                "tenantType": "individual",
                "nationality": "Pakistani",
                "legalCase": False,
                "language": "English",
                "agreement_doc": None,
                "isActive": True,
                "isApproved": False,
                "createdAt": "2025-06-24",
                "updatedAt": "2025-06-24",
            }
        },
    )


class ContractApprovalIn(BaseModel):
    user_id: UUID = Field(..., description="User ID (tenant)", alias="userId")
    property_unit_id: UUID = Field(
        ..., description="Unit to approve", alias="propertyUnitId"
    )
    is_approved: bool = Field(
        ..., description="Approval status (True to approve)", alias="isApproved"
    )

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "userId": "a1b2c3d4-5678-9012-3456-7890abcdef12",
                "propertyUnitId": "a1b2c3d4-5678-9012-3456-7890abcdef12",
                "isApproved": True,
            }
        },
    )


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


class UnitDetailOut(BaseModel):
    id: UUID
    name: str
    unit_no: str = Field(..., alias="unitNo")
    unit_type: str = Field(..., alias="unitType")
    size: str
    electricity_meter: Optional[str] = Field(None, alias="electricityMeter")
    water_meter: Optional[str] = Field(None, alias="waterMeter")
    pictures: Optional[List[str]] = None
    rent: Optional[str]

    class Config:
        from_attributes = True
        populate_by_name = True


class ContractListOut(BaseModel):
    id: UUID
    user_id: UUID = Field(..., alias="userId")
    property_unit_id: UUID = Field(..., alias="propertyUnitId")
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
    user_detail: Optional[UserDetailOut] = Field(None, alias="userDetail")
    unit_detail: Optional[UnitDetailOut] = Field(None, alias="unitDetail")

    class Config:
        from_attributes = True
        populate_by_name = True


class PaginatedContractList(BaseModel):
    success: bool
    total: int
    page: int
    size: int
    items: List[ContractListOut]


class ContractStandardResponse(BaseModel):
    success: bool
    message: str
    data: ContractCreateOut
