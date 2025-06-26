from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.modules.dashboardActivities.schemas import ActivitySummaryResponse
from app.modules.dashboardActivities.services import (
    get_super_admin_activity_summary,
    get_landlord_activity_summary,
    get_manager_stats,
)
from app.db.database import get_db

router = APIRouter()


@router.get("/activity-summary", response_model=ActivitySummaryResponse)
def get_activity_summary(db: Session = Depends(get_db)):
    return get_super_admin_activity_summary(db)


@router.get("/landlord-activity/{landlord_id}")
def landlord_activity_summary(landlord_id: UUID, db: Session = Depends(get_db)):
    return get_landlord_activity_summary(db, landlord_id)


@router.get("/manager/stats")
def manager_stats(landlord_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    return get_manager_stats(db, landlord_id, user_id)
