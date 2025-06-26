from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
# from uuid import UUID
from uuid import UUID  # ✅ Use this instead

from app.models.invoice_items import InvoiceItem
from app.modules.invoiceItems.schemas import InvoiceItemCreate, InvoiceItemUpdate
from app.utils.uploader import save_uploaded_file, is_upload_file
from app.utils.logger import error_log, debug_log
from uuid import uuid4

def get_all_invoice_items(db: Session, invoice_id: UUID = None, skip: int = 0, limit: int = 10):
    query = db.query(InvoiceItem)
    if invoice_id:
        query = query.filter(InvoiceItem.invoice_id == invoice_id)
    total = query.count()
    # .offset(skip).limit(limit)
    items = query.order_by(InvoiceItem.created_at.desc()).all()
    return total, items

def update_invoice_item_status(item_id: UUID, action: str, user_id: UUID, remarks: str, db: Session):
    item = db.query(InvoiceItem).get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if action not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    item.status = action
    item.remarks = remarks
    item.updated_by = user_id
    item.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(item)

    return item

def get_invoice_item(db: Session, item_id: UUID):
    return db.query(InvoiceItem).filter(InvoiceItem.id == item_id).first()


def create_invoice_item(db: Session, data: InvoiceItemCreate):
    file_path = None
    if is_upload_file(data.file):
        try:
            file_path = save_uploaded_file(data.file)
        except Exception as e:
            error_log(f"File upload failed: {str(e)}")

    item = InvoiceItem(
        id=uuid4(),
        invoice_id=data.invoice_id,
        amount=data.amount,
        currency=data.currency,
        status=data.status or "pending",
        payment_date=data.payment_date,
        payment_method=data.payment_method,
        description=data.description,
        remarks=data.remarks,
        file=file_path,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_invoice_item(db: Session, item_id: UUID, data: InvoiceItemUpdate):
    item = get_invoice_item(db, item_id)
    if not item:
        return None

    update_data = data.dict(exclude_unset=True)

    # Handle file upload during update
    if "file" in update_data and is_upload_file(update_data["file"]):
        try:
            file_path = save_uploaded_file(update_data["file"])
            update_data["file"] = file_path
        except Exception as e:
            error_log(f"File upload failed during update: {str(e)}")

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


def delete_invoice_item(db: Session, item_id: UUID):
    item = get_invoice_item(db, item_id)
    if not item:
        return None
    db.delete(item)
    db.commit()
    return item
