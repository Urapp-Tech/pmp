from fastapi import APIRouter, Depends
from typing import List
from datetime import date
from uuid import UUID
from app.modules.reports.schemas import (
    InvoiceReportFilter,
)
from sqlalchemy.orm import Session, joinedload
from typing import Optional, Dict, Any
from app.models.invoices import Invoice

def get_invoice_report_service(
    db: Session,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    status: Optional[str] = None,
    landlord_id: Optional[UUID] = None
) -> Dict[str, Any]:

    query = db.query(Invoice).options(joinedload(Invoice.items))

    if landlord_id:
        query = query.filter(Invoice.landlord_id == landlord_id)
    if from_date:
        query = query.filter(Invoice.payment_date >= from_date)
    if to_date:
        query = query.filter(Invoice.payment_date <= to_date)
    if status:
        query = query.filter(Invoice.status == status)

    invoices = query.all()
    total_paid = sum(inv.paid_amount or 0 for inv in invoices)

    return {
        "success": True,
        "message": "Invoice report fetched successfully.",
        "total": len(invoices),
        "items": invoices,
        "total_paid": total_paid,
    }