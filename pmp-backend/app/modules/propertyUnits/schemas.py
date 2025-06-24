# app/modules/property_units/schemas.py

from pydantic import BaseModel
from uuid import UUID
from typing import List


class PropertyUnitLOV(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class BuildingUnitsLOV(BaseModel):
    name: str
    items: List[PropertyUnitLOV]
