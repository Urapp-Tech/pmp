from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.modules.dashboardActivities.schemas import ActivitySummaryResponse
from app.modules.dashboardActivities.services import get_super_admin_activity_summary
from app.db.database import get_db

router = APIRouter()


@router.get("/activity-summary", response_model=ActivitySummaryResponse)
def get_activity_summary(db: Session = Depends(get_db)):
    return get_super_admin_activity_summary(db)
