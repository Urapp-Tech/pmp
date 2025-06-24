from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.modules.managers.schemas import (
    ManagerAssignCreate,
    ManagerAssignResponse,
)
from app.modules.managers.services import assign_units_to_manager
from app.db.database import get_db

router = APIRouter()


# @router.post(
#     "/assign",
#     response_model=ManagerAssignResponse,
#     status_code=status.HTTP_200_OK,
# )
# def assign_manager_users(data: ManagerAssignCreate, db: Session = Depends(get_db)):
#     result = assign_managers(data, db)
#     return result


@router.post(
    "/assign-units",
    response_model=ManagerAssignResponse,
    status_code=status.HTTP_200_OK,
)
def assign_manager_units(data: ManagerAssignCreate, db: Session = Depends(get_db)):
    result = assign_units_to_manager(data, db)
    return result
