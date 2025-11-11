from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from pydantic import UUID4
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.db.database import get_db
from app.modules.invoices.schemas import (
    InvoiceCreate,
    InvoiceUpdate,
    PaginatedInvoiceResponse,
    InvoiceResponse,
)
from app.modules.invoices.services import (
    create_invoice,
    get_invoice,
    get_all_invoices,
    update_invoice,
    delete_invoice,
)

router = APIRouter()


# @router.get("/", response_model=PaginatedInvoiceResponse)
# def list_invoices(
#     landlord_id: Optional[UUID4] = None,
#     search: Optional[str] = Query(""),
#     page: int = Query(1, ge=1),  # 👈 Only allow page 1 or greater
#     size: int = Query(10, ge=1), # 👈 prevent size=0 or negative
#     db: Session = Depends(get_db),
# ):
#     skip = (page - 1) * size
#     return get_all_invoices(
#         db=db,
#         skip=skip,
#         limit=size,
#         page=page,
#         landlord_id=landlord_id,
#         search=search,
#     )
@router.get("/", response_model=PaginatedInvoiceResponse)
def list_invoices(
    search: Optional[str] = Query(""),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    user_id: Optional[UUID4] = None,
    role_id: Optional[str] = None,
    mode: Optional[str] = Query(
        None, description="rentalUsers | landlordSubscriptions"
    ),
    subs_landlord_id: Optional[str] = Query(
        None, description="Required when mode=landlordSubscriptions"
    ),
):
    # normalize blank → None
    subs_id = subs_landlord_id.strip() if subs_landlord_id else None

    return get_all_invoices(
        db=db,
        user_id=str(user_id) if user_id else None,
        role_id=role_id,
        page=page,
        limit=size,
        search=search or "",
        mode=mode,
        subs_landlord_id=subs_id,
    )


@router.post("/create", response_model=InvoiceResponse)
def create(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    invoice = create_invoice(db, invoice)
    return {
        "success": True,
        "message": "Invoice created successfully.",
        "items": invoice,
    }


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def read(invoice_id: UUID4, db: Session = Depends(get_db)):
    invoice = get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "success": True,
        "message": "Invoice retrieved successfully.",
        "items": jsonable_encoder(invoice),
    }


@router.post("/update/{invoice_id}", response_model=InvoiceResponse)
def update(
    invoice_id: UUID4, invoice_data: InvoiceUpdate, db: Session = Depends(get_db)
):
    invoice = update_invoice(db, invoice_id, invoice_data)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "success": True,
        "message": "Invoice updated successfully.",
        "items": invoice,
    }


@router.post("/delete/{invoice_id}", response_model=InvoiceResponse)
def delete(invoice_id: UUID4, db: Session = Depends(get_db)):
    if not delete_invoice(db, invoice_id):
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "success": True,
        "message": "Invoice deleted successfully.",
        "items": None,
    }
