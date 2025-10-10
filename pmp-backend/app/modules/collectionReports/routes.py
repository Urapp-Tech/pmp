from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.modules.collectionReports.schemas import CollectionsListResponse
from app.modules.collectionReports import (
    services as collection_services,
)  # path as you organize

router = APIRouter()


@router.get("/collections/list", response_model=CollectionsListResponse)
def get_collections_report(
    db: Session = Depends(get_db),
    landlord_id: UUID = Query(..., description="Landlord to scope the report"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    q: Optional[str] = Query(None, description="Search by tenant first/last name"),
):
    if not landlord_id:
        raise HTTPException(status_code=400, detail="landlord_id is required")
    return collection_services.collections_report(
        db=db,
        landlord_id=landlord_id,
        page=page,
        page_size=page_size,
        q=q,
    )
