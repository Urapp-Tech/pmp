from pydantic import UUID4, BaseModel, Field
from typing import Optional, List, Union
from fastapi import UploadFile
from uuid import UUID
from datetime import datetime
from enum import Enum
# 🔸 Enum for property type
class PropertyTypeEnum(str, Enum):
    residential = "residential"
    commercial = "commercial"

# ---------------------------
# 🏢 Property Unit Schemas
# ---------------------------

class PropertyUnitBase(BaseModel):
    name: Optional[str] = Field(None, example="Unit A")
    unit_no: Optional[str] = Field(None, example="101")
    unit_type: Optional[str] = Field(None, example="2BHK")
    size: Optional[str] = Field(None, example="1200 sqft")
    rent: Optional[str] = Field(None, example="500 KD")
    description: Optional[str] = Field(None, example="Spacious with balcony")
    pictures: Optional[List[Union[UploadFile, str]]] = Field(default_factory=list, example=["url1", "url2"])
    bedrooms: Optional[str] = Field(None, example="2")
    bathrooms: Optional[str] = Field(None, example="2")
    water_meter: Optional[str] = Field(None, example="WM123456")
    electricity_meter: Optional[str] = Field(None, example="EM123456")
    status: Optional[str] = Field(None, example="available")

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
    pictures: Optional[List[Union[UploadFile, str]]] = Field(default_factory=list, example=["url1", "url2"])
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

class PropertyCreate(PropertyBase):
    landlord_id: UUID = Field(..., example="3fa85f64-5717-4562-b3fc-2c963f66afa6")
    units: Optional[List[PropertyUnitCreate]] = Field(default_factory=list)

class PropertyUpdate(PropertyBase):
    units: Optional[List[PropertyUnitCreate]] = Field(default_factory=list)

class PropertyOut(PropertyBase):
    id: UUID4|str = Field(..., example="3fa85f64-5717-4562-b3fc-2c963f66afa6")
    landlord_id: UUID4|str = Field(..., example="3fa85f64-5717-4562-b3fc-2c963f66afa6")
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