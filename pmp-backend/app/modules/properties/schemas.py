from pydantic import BaseModel, Field
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
    pictures: Optional[List[Union[UploadFile, str]]] = None

    bedrooms: Optional[str] = Field(None, example="2")
    bathrooms: Optional[str] = Field(None, example="2")
    water_meter: Optional[str] = Field(None, example="WM123456")
    electricity_meter: Optional[str] = Field(None, example="EM123456")
    status: Optional[str] = Field(None, example="available")

class PropertyUnitCreate(PropertyUnitBase):
    pictures: Optional[List[Union[UploadFile, str]]] = None

    pass

class PropertyUnitUpdate(PropertyUnitBase):
    pictures: Optional[List[Union[UploadFile, str]]] = None

    pass

class PropertyUnitOut(PropertyUnitBase):
    id: UUID
    property_id: UUID
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
    pictures: Optional[List[Union[UploadFile]]] = Field(default_factory=list, example=["url1", "url2"])
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
    pictures: Optional[List[Union[UploadFile, str]]]
    units: List[PropertyUnitCreate]

class PropertyCreate(PropertyBase):
    landlord_id: UUID = Field(..., example="3fa85f64-5717-4562-b3fc-2c963f66afa6")
    pictures: Optional[List[Union[UploadFile]]] = None
    units: List[PropertyUnitCreate] = Field(default_factory=list)

class PropertyUpdate(PropertyBase):
    pictures: Optional[List[Union[UploadFile]]] = None
    units: List[PropertyUnitUpdate] = Field(default_factory=list)

class PropertyOut(PropertyBase):
    id: UUID
    landlord_id: UUID
    property_units: List[PropertyUnitOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
