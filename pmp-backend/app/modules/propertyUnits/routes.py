from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.modules.propertyUnits.schemas import (
    BuildingUnitsLOV,
)
from app.modules.propertyUnits.services import get_units_lov_by_manager
from app.db.database import get_db

router = APIRouter()


@router.get("/lov/{landlord_id}", response_model=List[BuildingUnitsLOV])
def get_lov_by_manager(
    landlord_id: UUID = Path(..., description="landlord ID"),
    db: Session = Depends(get_db),
):
    return get_units_lov_by_manager(landlord_id, db)
