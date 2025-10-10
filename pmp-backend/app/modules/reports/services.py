from fastapi import APIRouter, Depends
from typing import List
from datetime import date, datetime, time, timedelta
from uuid import UUID
from app.modules.reports.schemas import (
    InvoiceReportFilter,
    ReportsOverviewQuery,
)
from sqlalchemy.orm import Session, joinedload
from typing import Optional, Dict, Any
from decimal import Decimal, InvalidOperation
from app.models.invoice_items import InvoiceItem
from app.models.invoices import Invoice
from app.models.managers import Manager
from app.models.tenants import Tenant
from app.models.users import User
from app.models.property_units import PropertyUnit
from app.models.properties import Property
from app.models.payment_history import PaymentHistory
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.dialects.postgresql import NUMERIC
from sqlalchemy import func, cast

# from app.models import Invoice, InvoiceItem, Manager, User, Tenant


# def get_invoice_report_service(
#     db: Session,
#     user_id: Optional[str] = None,
#     role_id: Optional[str] = None,
#     from_date: Optional[date] = None,
#     to_date: Optional[date] = None,
#     status: Optional[str] = None,
#     # search: Optional[str] = "",
# ) -> Dict[str, Any]:
#     query = db.query(Invoice).options(
#         joinedload(Invoice.items),
#         joinedload(Invoice.tenant).load_only(Tenant.id, Tenant.contract_number, Tenant.legal_case),
#         joinedload(Invoice.tenant)
#         .joinedload(Tenant.property_unit)
#         .joinedload(PropertyUnit.property)
#         .load_only(Property.id, Property.name),  # ✅ class attributes
#         joinedload(Invoice.tenant)
#         .joinedload(Tenant.property_unit)
#         .load_only(PropertyUnit.id, PropertyUnit.unit_no),  # ✅ class attributes
#         joinedload(Invoice.tenant)
#         .joinedload(Tenant.user)
#         .load_only(User.id, User.fname, User.lname, User.email),  # ✅ class attributes
#     )

#     if role_id == "Landlord":

#         user = db.query(User).filter(User.id == user_id).first()
#         if not user or not user.landlord_id:
#             return {
#                 "success": True,
#                 "message": "Landlord not found.",
#                 "total": 0,
#                 "items": [],
#                 "total_paid": 0,
#             }
#         query = query.filter(Invoice.landlord_id == user.landlord_id)

#     elif role_id == "Manager":
#         managers = (
#             db.query(Manager)
#             .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
#             .all()
#         )
#         assigned_property_ids = list(
#             {m.assign_property for m in managers if m.assign_property}
#         )
#         units = db.query(PropertyUnit).filter(PropertyUnit.property_id.in_(assigned_property_ids)).all()
#         assigned_unit_ids = [u.id for u in units]

#         if not assigned_unit_ids:
#             return {
#                 "success": True,
#                 "message": "No assigned units.",
#                 "total": 0,
#                 "items": [],
#                 "total_paid": 0,
#             }

#         query = query.join(Invoice.tenant).filter(
#             Tenant.property_unit_id.in_(assigned_unit_ids)
#         )

#     elif role_id == "User":
#         print("Searching tenants for user_id:", user_id)
#         print("from_date:", from_date)
#         print("to_date:", to_date)
#         print("status:", status)
#         tenants = db.query(Tenant).filter(Tenant.user_id == user_id).all()
#         tenant_ids_with_invoices = (
#             db.query(Invoice.tenant_id)
#             .filter(Invoice.tenant_id.in_([t.id for t in tenants]))
#             .distinct()
#             .all()
#         )
#         tenant_ids = [t[0] for t in tenant_ids_with_invoices]
#         print("Tenants found:", tenants)
#         if not tenants:
#             return {
#                 "success": True,
#                 "message": "Tenant not found.",
#                 "total": 0,
#                 "items": [],
#                 "total_paid": 0,
#             }

#         tenant_ids = [t.id for t in tenants]
#         print("Tenant IDs:", tenant_ids)
#         query = query.filter(Invoice.tenant_id.in_(tenant_ids))

#     if from_date:
#         from_date = datetime.combine(from_date, time.min)
#         query = query.filter(Invoice.created_at >= from_date)

#     if to_date:
#         to_date = datetime.combine(to_date, time.max)
#         query = query.filter(Invoice.created_at <= to_date)

#     if status:
#         query = query.filter(Invoice.status.ilike(status))

#     # if search:
#     #     search_term = f"%{search.lower()}%"
#     #     query = query.filter(Invoice.invoice_no.ilike(search_term))

#     invoices = query.distinct().all()
#     total_paid = sum(int(float(inv.total_amount or 0)) for inv in invoices)

#     return {
#         "success": True,
#         "message": "Invoice report fetched successfully.",
#         "total": len(invoices),
#         "items": invoices,
#         "total_paid": total_paid,
#     }


def _dec(val, default=Decimal("0")) -> Decimal:
    if val is None or val == "":
        return default
    try:
        return Decimal(str(val))
    except (InvalidOperation, TypeError, ValueError):
        return default


def _iso_or_none(dt) -> Optional[str]:
    if not dt:
        return None
    if isinstance(dt, str):
        s = dt.strip()
        if not s:
            return None
        try:
            return datetime.fromisoformat(s.replace(" ", "T")).isoformat()
        except Exception:
            return s
    try:
        return dt.isoformat()
    except Exception:
        return None


def get_invoice_report_service(
    db: Session,
    user_id: Optional[str] = None,
    role_id: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    status: Optional[str] = None,
) -> Dict[str, Any]:
    query = db.query(Invoice).options(
        joinedload(Invoice.items),
        joinedload(Invoice.tenant).load_only(
            Tenant.id,
            Tenant.contract_number,  # <-- ensures contract number is loaded
            Tenant.legal_case,
            Tenant.property_unit_id,
            Tenant.user_id,
        ),
        joinedload(Invoice.tenant)
        .joinedload(Tenant.property_unit)
        .load_only(
            PropertyUnit.id,
            PropertyUnit.unit_no,
            PropertyUnit.name,
            PropertyUnit.property_id,
        ),
        joinedload(Invoice.tenant)
        .joinedload(Tenant.user)
        .load_only(User.id, User.fname, User.lname, User.email),
        joinedload(Invoice.tenant)
        .joinedload(Tenant.property_unit)
        .joinedload(PropertyUnit.property)
        .load_only(
            Property.id,
            Property.name,
            Property.address,
            Property.address2,
            Property.civil_no,
            Property.landlord_id,
        ),
    )

    # ---- Role filters (unchanged) ----
    if role_id == "Landlord":
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.landlord_id:
            return {
                "success": True,
                "message": "Landlord not found.",
                "total": 0,
                "items": [],
                "total_paid": 0,
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
        units = (
            db.query(PropertyUnit)
            .filter(PropertyUnit.property_id.in_(assigned_property_ids))
            .all()
        )
        assigned_unit_ids = [u.id for u in units]
        if not assigned_unit_ids:
            return {
                "success": True,
                "message": "No assigned units.",
                "total": 0,
                "items": [],
                "total_paid": 0,
            }
        query = query.join(Invoice.tenant).filter(
            Tenant.property_unit_id.in_(assigned_unit_ids)
        )

    elif role_id == "User":
        tenants = db.query(Tenant).filter(Tenant.user_id == user_id).all()
        if not tenants:
            return {
                "success": True,
                "message": "Tenant not found.",
                "total": 0,
                "items": [],
                "total_paid": 0,
            }
        tenant_ids = [t.id for t in tenants]
        query = query.filter(Invoice.tenant_id.in_(tenant_ids))

    # ---- Date / status filters ----
    if from_date:
        query = query.filter(
            Invoice.created_at >= datetime.combine(from_date, time.min)
        )
    if to_date:
        query = query.filter(Invoice.created_at <= datetime.combine(to_date, time.max))
    if status:
        query = query.filter(Invoice.status.ilike(status))

    invoices: List[Invoice] = query.distinct().all()

    # ---- Prefetch owner names & latest payment history ----
    prop_landlord_ids = set()
    invoice_ids = []
    for inv in invoices:
        invoice_ids.append(inv.id)
        try:
            pu = inv.tenant.property_unit if inv.tenant else None
            prop = pu.property if pu else None
            if prop and prop.landlord_id:
                prop_landlord_ids.add(str(prop.landlord_id))
        except Exception:
            pass

    landlord_name_map: Dict[str, str] = {}
    if prop_landlord_ids:
        owners_by_id = db.query(User).filter(User.id.in_(list(prop_landlord_ids))).all()
        for u in owners_by_id:
            landlord_name_map[str(u.id)] = (
                f"{(u.fname or '').strip()} {(u.lname or '').strip()}".strip() or None
            )
        missing_ids = [lid for lid in prop_landlord_ids if lid not in landlord_name_map]
        if missing_ids:
            fallbacks = (
                db.query(User)
                .filter(User.landlord_id.in_(missing_ids), User.is_landlord == True)
                .all()
            )
            for u in fallbacks:
                landlord_name_map[str(u.landlord_id)] = (
                    f"{(u.fname or '').strip()} {(u.lname or '').strip()}".strip()
                    or None
                )

    latest_ph_map: Dict[str, PaymentHistory] = {}
    if invoice_ids:
        ph_rows = (
            db.query(PaymentHistory)
            .filter(PaymentHistory.invoice_id.in_(invoice_ids))
            .order_by(PaymentHistory.invoice_id.asc(), PaymentHistory.created_at.desc())
            .all()
        )
        seen = set()
        for ph in ph_rows:
            iid = str(ph.invoice_id)
            if iid in seen:
                continue
            seen.add(iid)
            latest_ph_map[iid] = ph

    # ---- Build response items (now with contract_no) ----
    items: List[Dict[str, Any]] = []
    for inv in invoices:
        tenant = getattr(inv, "tenant", None)
        pu = getattr(tenant, "property_unit", None) if tenant else None
        prop = getattr(pu, "property", None) if pu else None

        property_name = getattr(prop, "name", None)
        property_address = getattr(prop, "address", None) or getattr(
            prop, "address2", None
        )
        unit_no = getattr(pu, "unit_no", None)
        unit_name = getattr(pu, "name", None)
        prop_landlord_id = str(getattr(prop, "landlord_id", "")) if prop else None
        unit_owner = landlord_name_map.get(prop_landlord_id or "", None)
        lease_id = getattr(prop, "civil_no", None)
        contract_no = (
            getattr(tenant, "contract_number", None) if tenant else None
        )  # <-- NEW

        # assigned user name (only if both ids present)
        assigned_user_name = None
        if (
            tenant
            and getattr(tenant, "user_id", None)
            and getattr(tenant, "property_unit_id", None)
        ):
            u = getattr(tenant, "user", None)
            if u:
                assigned_user_name = (
                    f"{(u.fname or '').strip()} {(u.lname or '').strip()}".strip()
                    or None
                )

        latest_ph = latest_ph_map.get(str(inv.id))
        payment_details = {
            "payment_date": _iso_or_none(getattr(inv, "payment_date", None)),
            "payment_method": getattr(inv, "payment_method", None),
            "payment_id": getattr(latest_ph, "payment_id", None) if latest_ph else None,
            "reference_id": str(getattr(inv, "id")) if inv else None,
            "invoiced_amount": (
                float(_dec(getattr(latest_ph, "amount", None))) if latest_ph else 0.0
            ),
            "total_paid_amount": float(_dec(getattr(inv, "paid_amount", None))),
        }

        items.append(
            {
                "invoice_id": inv.id,
                "invoice_no": inv.invoice_no,
                "status": inv.status,
                "currency": inv.currency,
                "total_amount": float(_dec(inv.total_amount)),
                "paid_amount": float(_dec(inv.paid_amount, Decimal("0"))),
                "due_amount": float(_dec(inv.due_amount, Decimal("0"))),
                "invoice_date": _iso_or_none(getattr(inv, "invoice_date", None)),
                "created_at": _iso_or_none(inv.created_at),
                "updated_at": _iso_or_none(inv.updated_at),
                "property_details": {
                    "property_name": property_name,
                    "property_address": property_address,
                    "unit_no": unit_no,
                    "unit_name": unit_name,
                    "unit_owner": unit_owner,
                    "lease_id": lease_id,
                    "contract_no": contract_no,
                    "invoice_no": inv.invoice_no,
                    "assigned_user_name": assigned_user_name,
                },
                "payment_details": payment_details,
            }
        )

    total_paid_legacy = sum(int(float(inv.total_amount or 0)) for inv in invoices)

    return {
        "success": True,
        "message": "Invoice report fetched successfully.",
        "total": len(items),
        "items": items,
        "total_paid": total_paid_legacy,
    }


def get_invoice(db: Session, invoice_id: UUID) -> Invoice | None:
    return (
        db.query(Invoice)
        .options(
            joinedload(Invoice.items),
            joinedload(Invoice.tenant).joinedload(
                Tenant.user
            ),  # Load full user (or add .load_only if needed)
            joinedload(Invoice.tenant)
            .load_only(Tenant.id, Tenant.contract_number, Tenant.legal_case)
            .joinedload(Tenant.property_unit)
            .load_only(PropertyUnit.id, PropertyUnit.unit_no)
            .joinedload(PropertyUnit.property)
            .load_only(Property.id, Property.name),
        )
        .filter(Invoice.id == invoice_id)
        .first()
    )


def _f(v) -> float:
    try:
        return float(v or 0)
    except Exception:
        return 0.0


def _invoice_scope(db: Session, q, user_id: Optional[UUID], role_id: Optional[str]):
    if not role_id:
        return q
    if role_id == "Landlord":
        user = db.query(User).filter(User.id == user_id).first()
        if user and getattr(user, "landlord_id", None):
            return q.filter(Invoice.landlord_id == user.landlord_id)
        return q.filter(False)
    if role_id == "Manager":
        mans = (
            db.query(Manager)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .all()
        )
        assigned_property_ids = list(
            {m.assign_property for m in mans if m.assign_property}
        )
        units = (
            db.query(PropertyUnit)
            .filter(PropertyUnit.property_id.in_(assigned_property_ids))
            .all()
        )
        unit_ids = [u.id for u in units]
        if unit_ids:
            return q.join(Invoice.tenant).filter(Tenant.property_unit_id.in_(unit_ids))
        return q.filter(False)
    if role_id == "User":
        tenant_ids = [
            t.id for t in db.query(Tenant).filter(Tenant.user_id == user_id).all()
        ]
        if tenant_ids:
            return q.filter(Invoice.tenant_id.in_(tenant_ids))
        return q.filter(False)
    return q


def _units_scope(db: Session, q, user_id: Optional[UUID], role_id: Optional[str]):
    if not role_id:
        return q
    if role_id == "Landlord":
        user = db.query(User).filter(User.id == user_id).first()
        if user and getattr(user, "landlord_id", None):
            return q.join(Property, Property.id == PropertyUnit.property_id).filter(
                Property.landlord_id == user.landlord_id
            )
        return q.filter(False)
    if role_id == "Manager":
        mans = (
            db.query(Manager)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .all()
        )
        assigned_property_ids = list(
            {m.assign_property for m in mans if m.assign_property}
        )
        units = (
            db.query(PropertyUnit)
            .filter(PropertyUnit.property_id.in_(assigned_property_ids))
            .all()
        )
        unit_ids = [u.id for u in units]
        if unit_ids:
            return q.filter(PropertyUnit.id.in_(unit_ids))
        return q.filter(False)
    if role_id == "User":
        return q.filter(False)
    return q


# -------- ONE public service that returns everything --------
def get_reports_overview_service(
    db: Session, *, params: ReportsOverviewQuery
) -> Dict[str, Any]:
    year = params.year

    # ---------- Revenue (monthly) ----------
    base = db.query(Invoice).filter(func.extract("year", Invoice.created_at) == year)
    base = _invoice_scope(db, base, params.user_id, params.role_id)

    rows = (
        base.with_entities(
            func.date_trunc("month", Invoice.created_at).label("m"),
            func.sum(func.coalesce(cast(Invoice.total_amount, NUMERIC), 0)).label(
                "invoiced"
            ),
            func.sum(func.coalesce(cast(Invoice.paid_amount, NUMERIC), 0)).label(
                "collected"
            ),
            func.max(Invoice.currency).label("currency"),
        )
        .group_by("m")
        .order_by("m")
        .all()
    )

    month_names = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
    ]
    month_map = {
        (r.m.month if hasattr(r.m, "month") else int(r.m.strftime("%m"))): r
        for r in rows
    }

    revenue_series = []
    total_revenue = 0.0
    currency = None
    for idx, label in enumerate(month_names, start=1):
        r = month_map.get(idx)
        inv = float(r.invoiced) if r else 0.0
        col = float(r.collected) if r else 0.0
        if r and r.currency and not currency:
            currency = r.currency
        total_revenue += col
        revenue_series.append({"month": label, "invoiced": inv, "collected": col})

    revenue_block = {
        "year": year,
        "total_revenue": total_revenue,
        "currency": currency,
        "series": revenue_series,
    }

    # ---------- Recent Payments ----------
    q_pay = (
        db.query(Invoice)
        .options(
            joinedload(Invoice.tenant).joinedload(Tenant.user),
            joinedload(Invoice.tenant)
            .joinedload(Tenant.property_unit)
            .joinedload(PropertyUnit.property),
            joinedload(Invoice.tenant).joinedload(Tenant.property_unit),
        )
        .filter(Invoice.status.ilike("paid"))
        .order_by(Invoice.created_at.desc())
    )
    q_pay = _invoice_scope(db, q_pay, params.user_id, params.role_id)

    recent_items = []
    for inv in q_pay.limit(params.limit).all():
        user = inv.tenant.user if inv.tenant else None
        name = (
            " ".join(
                filter(
                    None, [getattr(user, "fname", None), getattr(user, "lname", None)]
                )
            )
            or None
        )
        prop = getattr(
            getattr(getattr(inv.tenant, "property_unit", None), "property", None),
            "name",
            None,
        )
        unit_no = getattr(getattr(inv.tenant, "property_unit", None), "unit_no", None)
        recent_items.append(
            {
                "invoice_id": inv.id,
                "paid_amount": _f(inv.paid_amount or inv.total_amount),
                "currency": inv.currency,
                "created_at": inv.created_at,
                "tenant_name": name,
                "property_name": prop,
                "unit_no": unit_no,
            }
        )

    recent_block = {"items": recent_items}

    # ---------- Unpaid Aging ----------
    cutoff = datetime.utcnow() - timedelta(days=params.lookback_days)
    q_unpaid = (
        db.query(Invoice)
        .filter(Invoice.status.ilike("un_paid"))
        .filter(Invoice.created_at >= cutoff)
    )
    q_unpaid = _invoice_scope(db, q_unpaid, params.user_id, params.role_id)

    def unpaid_amount(inv: Invoice) -> float:
        due = _f(inv.due_amount)
        if due > 0:
            return due
        return max(
            0.0, _f(inv.total_amount) - _f(inv.paid_amount) - _f(inv.discount_amount)
        )

    now = datetime.utcnow()
    b0_30 = b31_60 = b61_90 = b91p = 0.0
    total_unpaid = 0.0
    for inv in q_unpaid.all():
        age = (now - inv.created_at).days if inv.created_at else 0
        amt = unpaid_amount(inv)
        total_unpaid += amt
        if age <= 30:
            b0_30 += amt
        elif age <= 60:
            b31_60 += amt
        elif age <= 90:
            b61_90 += amt
        else:
            b91p += amt

    unpaid_block = {
        "lookback_days": params.lookback_days,
        "total_unpaid": total_unpaid,
        "buckets": [
            {"label": "0-30", "value": b0_30},
            {"label": "31-60", "value": b31_60},
            {"label": "61-90", "value": b61_90},
            {"label": "91+", "value": b91p},
        ],
    }

    # ---------- Occupancy ----------
    q_units = (
        db.query(PropertyUnit)
        .join(Property, Property.id == PropertyUnit.property_id)
        .filter(
            Property.is_active == True
        )  # if you don't have this flag, remove this line
        .filter(PropertyUnit.is_active == True)
    )
    q_units = _units_scope(db, q_units, params.user_id, params.role_id)

    units = q_units.all()
    rented = sum(1 for u in units if (u.status or "").lower() == "occupied")
    vacant = sum(1 for u in units if (u.status or "").lower() == "available")
    total_units = rented + vacant
    occ_block = {
        "total_units": total_units,
        "rented": rented,
        "vacant": vacant,
        "percent_rented": (
            round((rented / total_units) * 100, 2) if total_units else 0.0
        ),
        "percent_vacant": (
            round((vacant / total_units) * 100, 2) if total_units else 0.0
        ),
    }

    # ---------- Final combined payload ----------
    return {
        "success": True,
        "revenue": revenue_block,
        "recent_payments": recent_block,
        "unpaid_aging": unpaid_block,
        "occupancy": occ_block,
    }
