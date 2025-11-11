from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Literal
from uuid import UUID

from app.modules.reports.schemas import (
    InvoiceReportFilter,
    ReportsOverviewResponse,
    ReportsOverviewQuery,
)
from app.modules.reports.services import (
    get_invoice_report_service,
    get_invoice,
    get_reports_overview_service,
)
from app.db.database import get_db

router = APIRouter()


@router.post("/invoices")
def get_invoice_report(payload: InvoiceReportFilter, db: Session = Depends(get_db)):
    return get_invoice_report_service(
        db=db,
        user_id=payload.user_id,
        role_id=payload.role_id,
        from_date=payload.from_date,
        to_date=payload.to_date,
        status=payload.status,
        # landlord_id=payload.landlord_id
    )


@router.get("/invoice/detail/{invoice_id}")
def get_invoice_report(invoice_id: UUID, db: Session = Depends(get_db)):
    invoice: any = get_invoice(db=db, invoice_id=invoice_id)
    return {
        "success": True,
        "message": "Invoice retrieved successfully.",
        "items": invoice,
    }


Role = Literal["Landlord", "Manager", "User"]


@router.get("/overview", response_model=ReportsOverviewResponse)
def reports_overview(
    year: int = Query(..., description="Year for monthly series"),
    limit: int = Query(3, ge=1, le=20, description="Recent payments count"),
    lookback_days: int = Query(150, ge=30, le=365),
    user_id: Optional[UUID] = Query(None),
    role_id: Optional[Role] = Query(None),  # <-- no regex/pattern needed now
    db: Session = Depends(get_db),
):
    params = ReportsOverviewQuery(
        year=year,
        limit=limit,
        lookback_days=lookback_days,
        user_id=user_id,
        role_id=role_id,
    )
    return get_reports_overview_service(db=db, params=params)
