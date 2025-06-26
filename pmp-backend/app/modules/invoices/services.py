from pydantic import UUID4
from sqlalchemy.orm import Session
from app.models.invoices import Invoice
from app.modules.invoices.schemas import InvoiceCreate, InvoiceUpdate
from sqlalchemy.orm import joinedload

def create_invoice(db: Session, invoice_data: InvoiceCreate) -> Invoice:
    invoice = Invoice(**invoice_data.dict())

    # Auto-generate invoice_no if not provided
    if not invoice.invoice_no and invoice.landlord_id:
        invoice.invoice_no = generate_invoice_no(db, invoice.landlord_id)

    db.add(invoice)
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


def get_invoice(db: Session, invoice_id: UUID4) -> Invoice | None:
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()



def get_all_invoices(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    page: int = 1,
    landlord_id: UUID4 | None = None,
    search: str = "",
) -> dict:
    query = db.query(Invoice).options(joinedload(Invoice.items)).filter(Invoice.landlord_id == landlord_id)

    if search:
        query = query.filter(Invoice.invoice_no.ilike(f"%{search.lower()}%"))

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {
        "success": True,
        "message": "Invoices retrieved successfully.",
        "total": total,
        "page": page,
        "size": limit,
        "items": items,
    }



def update_invoice(db: Session, invoice_id: UUID4, update_data: InvoiceUpdate) -> Invoice | None:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        return None

    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(invoice, key, value)

    db.commit()
    db.refresh(invoice)
    return invoice


def delete_invoice(db: Session, invoice_id: UUID4) -> bool:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        return False

    db.delete(invoice)
    db.commit()
    return True


def generate_invoice_no(db: Session, landlord_id: str) -> str:
    # Count existing invoices for this landlord
    invoice_count = db.query(Invoice).filter(Invoice.landlord_id == landlord_id).count() +1
    invoice_number = f"inv-rent-{invoice_count + 1:05d}"
    return invoice_number