from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.modules.reports.schemas import InvoiceReportFilter
from app.modules.reports.services import get_invoice_report_service

router = APIRouter()

@router.post("/adminapp/invoice/report")
def get_invoice_report(payload: InvoiceReportFilter, db: Session = Depends(get_db)):
    return get_invoice_report_service(
        db=db,
        from_date=payload.from_date,
        to_date=payload.to_date,
        status=payload.status,
        landlord_id=payload.landlord_id
    )
