from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from pydantic import UUID4
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.db.database import get_db
from app.modules.invoiceItems.schemas import (
    InvoiceItemActionPayload,
    InvoiceItemCreate,
    InvoiceItemUpdate,
    InvoiceItemOut,
    InvoiceItemResponse,
    PaginatedInvoiceItemResponse,
)
from app.modules.invoiceItems.services import (
    create_invoice_item as create_invoice_item_service,
    delete_invoice_item as delete_invoice_item_service,
    get_invoice_item as get_invoice_item_service,
    get_all_invoice_items,
    update_invoice_item as update_invoice_item_service,
    update_invoice_item_status,
)

router = APIRouter()

@router.get("/", response_model=PaginatedInvoiceItemResponse)
async def list_invoice_items(
    invoice_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * size
    total, items = get_all_invoice_items(db, invoice_id=invoice_id, skip=skip, limit=size)

    return PaginatedInvoiceItemResponse(
        success=True,
        message="Invoice items retrieved successfully",
        total=total,
        page=page,
        size=size,
        items=[InvoiceItemOut(**item.__dict__) for item in items]
    )

@router.post("/", response_model=InvoiceItemResponse)
async def create_invoice_item(
    invoice_id: UUID = Form(...),
    amount: Optional[str] = Form(None),
    currency: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    payment_date: Optional[str] = Form(None),
    payment_method: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    remarks: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    payload = InvoiceItemCreate(
        invoice_id=invoice_id,
        amount=amount,
        currency=currency,
        status=status,
        payment_date=payment_date,
        payment_method=payment_method,
        description=description,
        remarks=remarks,
        file=file,
    )
    item = create_invoice_item_service(db, payload)
    return InvoiceItemResponse(
        success=True,
        message="Invoice item created successfully",
        items=InvoiceItemOut(**item.__dict__)
    )

@router.get("/{item_id}", response_model=InvoiceItemResponse)
async def retrieve_invoice_item(item_id: UUID, db: Session = Depends(get_db)):
    item = get_invoice_item_service(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Invoice item not found")
    return InvoiceItemResponse(
        success=True,
        message="Invoice item retrieved successfully",
        items=InvoiceItemOut(**item.__dict__)
    )




@router.post("/{item_id}", response_model=InvoiceItemResponse)
async def update_invoice_item(
    item_id: UUID,
    amount: Optional[str] = Form(None),
    currency: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    payment_date: Optional[str] = Form(None),
    payment_method: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    remarks: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    payload = InvoiceItemUpdate(
        amount=amount,
        currency=currency,
        status=status,
        payment_date=payment_date,
        payment_method=payment_method,
        description=description,
        remarks=remarks,
        file=file,
    )
    updated = update_invoice_item_service(db, item_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Invoice item not found")
    return InvoiceItemResponse(
        success=True,
        message="Invoice item updated successfully",
        items=InvoiceItemOut(**updated.__dict__)
    )

@router.post("/{item_id}/{action}", response_model=InvoiceItemResponse)
def handle_invoice_item_action(
    item_id: UUID4,
    action: str,
    payload: InvoiceItemActionPayload,
    db: Session = Depends(get_db),
):
    updated = update_invoice_item_status(
        item_id=item_id,
        action=action,
        user_id=payload.user_id,
        remarks=payload.remarks,
        db=db,
    )

    return InvoiceItemResponse(
        success=True,
        message=f"Item {action} successfully",
        items=InvoiceItemOut(**updated.__dict__),
    )
@router.delete("/{item_id}", response_model=InvoiceItemResponse)
async def delete_invoice_item(item_id: UUID, db: Session = Depends(get_db)):
    deleted = delete_invoice_item_service(db, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Invoice item not found")
    return InvoiceItemResponse(
        success=True,
        message="Invoice item deleted successfully",
        items=InvoiceItemOut(**deleted.__dict__)
    )
