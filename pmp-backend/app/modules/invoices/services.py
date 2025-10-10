from typing import Optional, Dict, Any
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
from datetime import datetime, date, timezone, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import or_, func
from decimal import Decimal, InvalidOperation

now = datetime.now(timezone.utc)


def _to_decimal(val, default=None):
    if val is None or val == "":
        return default
    try:
        return Decimal(str(val))
    except (InvalidOperation, TypeError, ValueError):
        return default


def _to_iso_date_str(val) -> str | None:
    """
    Accepts 'YYYY-MM-DD' string, datetime.date, datetime.datetime, or None.
    Returns 'YYYY-MM-DD' string or None.
    """
    if val is None:
        return None
    if isinstance(val, date):
        # datetime is also a date, so this covers both
        return val.strftime("%Y-%m-%d")
    if isinstance(val, str):
        s = val.strip()
        if not s:
            return None
        # try the common format you’re sending
        try:
            _ = datetime.strptime(s, "%Y-%m-%d")
            return s
        except Exception:
            # last resort: try fromisoformat without time
            try:
                d = date.fromisoformat(s[:10])
                return d.strftime("%Y-%m-%d")
            except Exception:
                return None
    return None


def create_invoice(db: Session, invoice_data) -> Invoice:
    """
    Create an invoice with safe defaults:
      - submitted_type: 'auto' (required by DB NOT NULL)
      - status: 'unpaid' if not provided
      - due_amount: total_amount if not provided
    """
    # Normalize numeric-like fields that often arrive as strings
    total_amount = _to_decimal(invoice_data.total_amount, default=Decimal("0"))
    paid_amount = _to_decimal(invoice_data.paid_amount, default=None)
    discount_amount = _to_decimal(invoice_data.discount_amount, default=None)
    due_amount = _to_decimal(invoice_data.due_amount, default=None)

    # Defaults
    status = invoice_data.status or "unpaid"

    # If due_amount not provided, set it to total_amount (your earlier data matches this)
    if due_amount is None:
        due_amount = total_amount

    # Build the ORM instance
    invoice = Invoice(
        landlord_id=invoice_data.landlord_id,
        tenant_id=invoice_data.tenant_id,
        invoice_no=invoice_data.invoice_no,  # may be None; we handle next
        total_amount=float(total_amount) if total_amount is not None else None,
        paid_amount=float(paid_amount) if paid_amount is not None else None,
        discount_amount=float(discount_amount) if discount_amount is not None else None,
        due_amount=float(due_amount) if due_amount is not None else None,
        currency=invoice_data.currency,
        status=status,
        payment_date=None,  # you can parse if you start sending this
        invoice_date=_to_iso_date_str(invoice_data.invoice_date),
        due_date=_to_iso_date_str(invoice_data.due_date),
        description=invoice_data.description,
        payment_method=invoice_data.payment_method,
        qty=str(invoice_data.qty) if invoice_data.qty is not None else None,
        created_by=invoice_data.created_by or "machine",
        updated_by=invoice_data.updated_by,
        submitted_type="auto",  # <<< CRITICAL: satisfy NOT NULL constraint
    )

    # Auto-generate invoice_no if not provided
    if not invoice.invoice_no and invoice.landlord_id:
        invoice_no = generate_invoice_no(db, invoice.landlord_id)
        invoice.invoice_no = invoice_no
        # keep due_amount as total_amount default (already set)

    # (Optional) fetch tenant (for email)
    tenant = (
        db.query(Tenant)
        .options(joinedload(Tenant.user))
        .filter(Tenant.id == invoice.tenant_id)
        .first()
    )

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    # --- Email (safe) ---
    try:
        inv_no_for_email = invoice.invoice_no or "-"
        due_date_str = "-"
        if invoice.due_date:
            # invoice.due_date is stored as 'YYYY-MM-DD' string (from _to_iso_date_str)
            try:
                due_date_str = datetime.strptime(invoice.due_date, "%Y-%m-%d").strftime(
                    "%d %B %Y"
                )
            except Exception:
                due_date_str = invoice.due_date

        if tenant and tenant.user:
            html_content = render_template(
                "invoice_created.html",
                {
                    "name": f"{tenant.user.fname} {tenant.user.lname}".strip(),
                    "invoice_title": inv_no_for_email,
                    "status": invoice.status,
                    "due_date": due_date_str,
                },
            )
            send_email(
                to_email=tenant.user.email,
                subject="Your Invoice has been created",
                html_content=html_content,
            )
    except Exception:
        # Don’t break creation on email/render errors
        pass

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
    *,
    mode: Optional[str] = None,
    subs_landlord_id: Optional[str] = None,
) -> dict:
    skip = (page - 1) * limit
    page = max(1, int(page))
    limit = max(1, int(limit))

    mode_norm = (mode or "").strip().lower()
    subs_landlord_id = (subs_landlord_id or "").strip() or None

    # ---------- MODE: landlordSubscriptions (SUB- only) ----------
    if mode_norm == "landlordsubscriptions":
        if not subs_landlord_id:
            return {
                "success": True,
                "message": "landlordSubscriptions mode requires subs_landlord_id.",
                "total": 0,
                "page": page,
                "size": limit,
                "items": [],
            }

        query = (
            db.query(Invoice)
            .options(joinedload(Invoice.items))
            .filter(
                Invoice.landlord_id == subs_landlord_id,
                Invoice.tenant_id.is_(None),
                Invoice.invoice_no.ilike(
                    "SUB-%"
                ),  # <-- ensure ONLY subscription invoices
            )
        )

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    Invoice.invoice_no.ilike(like),
                    Invoice.description.ilike(like),
                )
            )

        count_sq = query.order_by(None).with_entities(Invoice.id).subquery()
        total = db.query(func.count()).select_from(count_sq).scalar() or 0

        items = (
            query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
        )

        return {
            "success": True,
            "message": "Landlord subscription invoices retrieved.",
            "total": total,
            "page": page,
            "size": limit,
            "items": items,
        }

    # ---------- DEFAULT / rentalUsers (inv- only) ----------
    query = db.query(Invoice).options(
        joinedload(Invoice.items),
        joinedload(Invoice.tenant)
        .joinedload(Tenant.property_unit)
        .joinedload(PropertyUnit.property)
        .load_only(Property.id, Property.name),
        joinedload(Invoice.tenant)
        .joinedload(Tenant.property_unit)
        .load_only(PropertyUnit.id, PropertyUnit.unit_no),
        joinedload(Invoice.tenant)
        .joinedload(Tenant.user)
        .load_only(User.id, User.fname, User.lname, User.email),
    )

    # Keep existing role scoping
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
        assigned_property_ids = list(
            {m.assign_property for m in managers if m.assign_property}
        )
        if not assigned_property_ids:
            return {
                "success": True,
                "message": "No assigned units.",
                "total": 0,
                "page": page,
                "size": limit,
                "items": [],
            }
        units = (
            db.query(PropertyUnit)
            .filter(PropertyUnit.property_id.in_(assigned_property_ids))
            .all()
        )
        assigned_unit_ids = [u.id for u in units]
        query = query.join(Invoice.tenant).filter(
            Tenant.property_unit_id.in_(assigned_unit_ids)
        )

    elif role_id == "User":
        tenants = (
            db.query(Tenant)
            .filter(
                Tenant.user_id == user_id,
                Tenant.is_approved == True,
                Tenant.contract_start <= now,
                Tenant.contract_end >= now,
            )
            .all()
        )
        if not tenants:
            return {
                "success": True,
                "message": "No active tenant contracts found for user.",
                "total": 0,
                "page": page,
                "size": limit,
                "items": [],
            }
        tenant_ids = [t.id for t in tenants]
        query = query.filter(Invoice.tenant_id.in_(tenant_ids))

    # ✅ Enforce rental invoices only (exclude SUB-)
    query = query.filter(Invoice.invoice_no.ilike("inv-%"))

    # Search within rental invoices
    if search:
        query = query.filter(Invoice.invoice_no.ilike(f"%{search}%"))

    count_sq = query.order_by(None).with_entities(Invoice.id).subquery()
    total = db.query(func.count()).select_from(count_sq).scalar() or 0

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
# def get_tenants_with_upcoming_date(db, days_before_due: int = 7):
#     """
#     Fetch invoices whose due_date is within X days.
#     """
#     now_utc = datetime.now()
#     upcoming_date = now_utc + timedelta(days=days_before_due)

#     invoices = db.query(Invoice).all()  # 🔥 Fetch ALL invoices, no due_date check
#     print(f"📥 [TEST] Found {len(invoices)} invoices for daily generation")
#     return invoices


# for production


def get_tenants_with_upcoming_date(db, days_before_due: int = 7):
    """
    Fetch invoices whose due_date is within X days.
    """
    now_utc = datetime.now()
    upcoming_date = now_utc + timedelta(days=days_before_due)

    invoices = db.query(Invoice).filter(Invoice.due_date <= upcoming_date).all()
    print(
        f"📥 [PROD] Found {len(invoices)} invoices due in next {days_before_due} days"
    )
    return invoices


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
        due_amount=previous_invoice.total_amount,
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
