from typing import Optional
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.models.invoice_items import InvoiceItem
from app.models.invoices import Invoice
from app.models.managers import Manager
from app.models.tenants import Tenant
from app.models.users import User
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
    user_id: Optional[str] = None,
    role_id: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    search: str = "",
) -> dict:
    skip = (page - 1) * limit

    if role_id == "Super Admin":
        return {
            "success": True,
            "message": "Super Admin is not allowed to view invoices.",
            "total": 0,
            "page": page,
            "size": limit,
            "items": [],
        }

    query = db.query(Invoice).options(joinedload(Invoice.items))

    if role_id == "Landlord":
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.landlord_id:
            return {
                "success": True,
                "message": "Landlord not found.",
                "total": 0,
                "page": page,
                "size": limit,
                "items": [],
            }
        query = query.filter(Invoice.landlord_id == user.landlord_id)

    elif role_id == "Manager":
        managers = (
            db.query(Manager)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .all()
        )
        assigned_unit_ids = list(
            {m.assign_property_unit for m in managers if m.assign_property_unit}
        )

        if not assigned_unit_ids:
            return {
                "success": True,
                "message": "No assigned units.",
                "total": 0,
                "page": page,
                "size": limit,
                "items": [],
            }

        query = query.join(Invoice.tenant).filter(
            Tenant.property_unit_id.in_(assigned_unit_ids)
        )

    elif role_id == "User":
        tenant = db.query(Tenant).filter(Tenant.user_id == user_id).first()
        if not tenant:
            return {
                "success": True,
                "message": "Tenant not found.",
                "total": 0,
                "page": page,
                "size": limit,
                "items": [],
            }

        query = query.filter(Invoice.tenant_id == tenant.id)

    else:
        return {
            "success": True,
            "message": "Invalid role.",
            "total": 0,
            "page": page,
            "size": limit,
            "items": [],
        }

    if search:
        query = query.filter(Invoice.invoice_no.ilike(f"%{search.lower()}%"))

    total = query.distinct().count()
    items = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "success": True,
        "message": "Invoices retrieved successfully.",
        "total": total,
        "page": page,
        "size": limit,
        "items": items,
    }


def update_invoice(
    db: Session, invoice_id: UUID4, update_data: InvoiceUpdate
) -> Invoice | None:
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
    invoice_count = (
        db.query(Invoice).filter(Invoice.landlord_id == landlord_id).count() + 1
    )
    invoice_number = f"inv-rent-{invoice_count + 1:05d}"
    return invoice_number
