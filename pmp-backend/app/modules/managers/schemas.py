from pydantic import BaseModel, Field
from uuid import UUID
from typing import List, Optional
from datetime import datetime


class AssignUserOut(BaseModel):
    id: UUID
    fname: Optional[str]
    lname: Optional[str]
    profile_pic: Optional[str] = Field(None, alias="profilePic")

    class Config:
        from_attributes = True
        populate_by_name: True

    @classmethod
    def model_validate(cls, obj):
        data = obj.__dict__.copy()
        data["profilePic"] = getattr(obj, "profile_pic", None)
        return super().model_validate(data)


class PropertyUnitOut(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class ManagerAssignCreate(BaseModel):
    manager_user_id: UUID = Field(..., alias="managerUserId")
    assign_units: List[UUID] = Field(..., alias="assignUnits")


class ManagerUnitOut(BaseModel):
    id: UUID
    manager_user_id: UUID = Field(None, alias="managerUserId")
    assign_property_unit: PropertyUnitOut
    is_active: bool = Field(..., alias="isActive")
    created_at: datetime = Field(..., alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True


class ManagerAssignResponse(BaseModel):
    message: str
    success: bool
    items: List[ManagerUnitOut]
    # available_units: Optional[List[PropertyUnitOut]] = []

    class Config:
        from_attributes = True
