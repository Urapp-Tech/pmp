from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.db.database import get_db
from app.modules.invoices.schemas import InvoiceCreate, InvoiceUpdate, PaginatedInvoiceResponse, InvoiceResponse
from app.modules.invoices.services import (
    create_invoice,
    get_invoice,
    get_all_invoices,
    update_invoice,
    delete_invoice
)

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("/", response_model=PaginatedInvoiceResponse)
def list_invoices(
    landlord_id: Optional[UUID] = Query(None),
    search: Optional[str] = Query(""),
    page: int = 1,
    size: int = 10,
    db: Session = Depends(get_db),
):
    skip = (page - 1) * size
    return get_all_invoices(
        db=db,
        skip=skip,
        limit=size,
        page=page,
        landlord_id=landlord_id,
        search=search,
    )


@router.post("/create", response_model=InvoiceResponse)
def create(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    invoice = create_invoice(db, invoice)
    return {
            "success": True,
            "message": "Invoice fetched successfully.",
            "items": invoice,
        }

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def read(invoice_id: UUID, db: Session = Depends(get_db)):
    invoice = get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "success": True,
        "message": "Invoice retrieved successfully.",
        "items": jsonable_encoder(invoice),
    }


@router.post("/update/{invoice_id}", response_model=InvoiceResponse)
def update(invoice_id: UUID, invoice_data: InvoiceUpdate, db: Session = Depends(get_db)):
    invoice = update_invoice(db, invoice_id, invoice_data)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "success": True,
        "message": "Invoice updated successfully.",
        "items": invoice,
    }


@router.post("/delete/{invoice_id}", response_model=InvoiceResponse)
def delete(invoice_id: UUID, db: Session = Depends(get_db)):
    if not delete_invoice(db, invoice_id):
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "success": True,
        "message": "Invoice deleted successfully.",
        "items": None,
    }
