# app/modules/property_units/schemas.py

from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional


class PropertyUnitLOV(BaseModel):
    id: UUID
    name: Optional[str]
    unit_no: Optional[str]
    rent: Optional[str]

    class Config:
        from_attributes = True


class BuildingUnitsLOV(BaseModel):
    name: Optional[str]
    # unit_no: str
    items: List[PropertyUnitLOV]
