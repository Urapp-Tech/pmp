from typing import Optional
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.models.invoice_items import InvoiceItem
from app.models.invoices import Invoice
from app.models.managers import Manager
from app.models.properties import Property
from app.models.property_units import PropertyUnit
from app.models.tenants import Tenant
from app.models.users import User
from app.modules.invoices.schemas import InvoiceCreate, InvoiceUpdate
from sqlalchemy.orm import joinedload
from app.utils.email_service import render_template, send_email

# from datetime import datetime, timedelta
from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import and_

now = datetime.now(timezone.utc)


def create_invoice(db: Session, invoice_data: InvoiceCreate) -> Invoice:
    invoice = Invoice(**invoice_data.dict())

    # Auto-generate invoice_no if not provided
    if not invoice.invoice_no and invoice.landlord_id:
        invoice_no = generate_invoice_no(db, invoice.landlord_id)
        invoice.invoice_no = invoice_no
    user = (
        db.query(Tenant)
        .options(joinedload(Tenant.user))
        .filter(Tenant.id == invoice.tenant_id)
        .first()
    )

    db.add(invoice)
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    html_content = render_template(
        "invoice_created.html",
        {
            "name": f"{user.user.fname} {user.user.lname}",
            "invoice_title": invoice_no,
            "status": invoice.status,
            "due_date": datetime.strptime(invoice.due_date, "%Y-%m-%d").strftime(
                "%d %B %Y"
            ),
        },
    )
    send_email(
        to_email="testapp.mailed@gmail.com",
        subject="Your Invoice has been created",
        html_content=html_content,
    )
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

    # if role_id == "Super Admin":
    #     return {
    #         "success": True,
    #         "message": "Super Admin is not allowed to view invoices.",
    #         "total": 0,
    #         "page": page,
    #         "size": limit,
    #         "items": [],
    #     }

    query = db.query(Invoice).options(
        joinedload(Invoice.items),
        joinedload(Invoice.tenant)
        .joinedload(Tenant.property_unit)
        .joinedload(PropertyUnit.property)
        .load_only(Property.id, Property.name),  # ✅ class attributes
        joinedload(Invoice.tenant)
        .joinedload(Tenant.property_unit)
        .load_only(PropertyUnit.id, PropertyUnit.unit_no),  # ✅ class attributes
        joinedload(Invoice.tenant)
        .joinedload(Tenant.user)
        .load_only(User.id, User.fname, User.lname, User.email),  # ✅ class attributes
    )

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

    # else:
    #     return {
    #         "success": True,
    #         "message": "Invalid role.",
    #         "total": 0,
    #         "page": page,
    #         "size": limit,
    #         "items": [],
    #     }

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


# for testing
def get_tenants_with_upcoming_date(db, days_before_due: int = 7):
    """
    Fetch invoices whose due_date is within X days.
    """
    now_utc = datetime.now()
    upcoming_date = now_utc + timedelta(days=days_before_due)

    invoices = db.query(Invoice).all()  # 🔥 Fetch ALL invoices, no due_date check
    print(f"📥 [TEST] Found {len(invoices)} invoices for daily generation")
    return invoices


# for production

# def get_tenants_with_upcoming_date(db, days_before_due: int = 7):
#     """
#     Fetch invoices whose due_date is within X days.
#     """
#     now_utc = datetime.now()
#     upcoming_date = now_utc + timedelta(days=days_before_due)

#     invoices = db.query(Invoice).filter(Invoice.due_date <= upcoming_date).all()
#     print(
#         f"📥 [PROD] Found {len(invoices)} invoices due in next {days_before_due} days"
#     )
#     return invoices


def create_next_invoice(db, previous_invoice: Invoice) -> Invoice:
    """
    Create a new invoice based on the previous one and send email to tenant user.
    """
    try:
        qty = int(previous_invoice.qty or 1)  # default to 1
    except ValueError:
        print(f"⚠️ Invalid qty '{previous_invoice.qty}', defaulting to 1 month")
        qty = 1

    try:
        # Convert due_date to datetime if it’s a string
        if isinstance(previous_invoice.due_date, str):
            due_date = datetime.fromisoformat(previous_invoice.due_date)
        else:
            due_date = previous_invoice.due_date
    except Exception as e:
        print(f"⚠️ [TEST] Invalid due_date '{previous_invoice.due_date}': {e}")
        # fallback: use current datetime
        due_date = datetime.now()

    if qty == 1:
        next_due_date = due_date + relativedelta(months=1)
    elif qty == 12:
        next_due_date = due_date + relativedelta(years=1)
    else:
        next_due_date = due_date + relativedelta(months=qty)

    print(f"📆 [PROD] Next due date: {next_due_date}")

    new_invoice_no = generate_invoice_no(db, previous_invoice.landlord_id)

    # Create new invoice
    new_invoice_data = InvoiceCreate(
        tenant_id=previous_invoice.tenant_id,
        landlord_id=previous_invoice.landlord_id,
        total_amount=previous_invoice.total_amount,
        due_date=next_due_date.isoformat(),
        description=f"Auto-generated for period ending {next_due_date.strftime('%B %Y')}",
        invoice_no=new_invoice_no,
        status="unpaid",
    )
    new_invoice = create_invoice(db, new_invoice_data)

    # Fetch tenant and user
    tenant = db.query(Tenant).filter(Tenant.id == previous_invoice.tenant_id).first()
    if not tenant:
        print(f"⚠️ No tenant found for invoice {previous_invoice.id}")
        return new_invoice

    user = db.query(User).filter(User.id == tenant.user_id).first()
    if user and user.email:
        html_content = render_template(
            "invoice_created.html",
            {
                "name": f"{user.fname} {user.lname}",
                "invoice_title": new_invoice.invoice_no,
                "status": "unpaid",
                "due_date": next_due_date.strftime("%d %B %Y"),
            },
        )
        send_email(
            to_email=user.email,
            subject="Your New Invoice",
            html_content=html_content,
        )
        print(f"📧 Email sent to {user.email}")
    else:
        print(f"⚠️ No user/email found for tenant {tenant.id}")

    return new_invoice
