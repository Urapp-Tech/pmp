from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.modules.reports.schemas import InvoiceReportFilter
from app.modules.reports.services import get_invoice_report_service,get_invoice
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
    invoice:any = get_invoice(db=db,invoice_id=invoice_id)
    return {
        "success": True,
        "message": "Invoice retrieved successfully.",
        "items": invoice,
        }
