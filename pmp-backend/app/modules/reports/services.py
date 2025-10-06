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
from app.models.invoice_items import InvoiceItem
from app.models.invoices import Invoice
from app.models.managers import Manager
from app.models.tenants import Tenant
from app.models.users import User
from app.models.property_units import PropertyUnit
from app.models.properties import Property
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.dialects.postgresql import NUMERIC
from sqlalchemy import func, cast

# from app.models import Invoice, InvoiceItem, Manager, User, Tenant


def get_invoice_report_service(
    db: Session,
    user_id: Optional[str] = None,
    role_id: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    status: Optional[str] = None,
    # search: Optional[str] = "",
) -> Dict[str, Any]:
    query = db.query(Invoice).options(
        joinedload(Invoice.items),
        joinedload(Invoice.tenant).load_only(Tenant.id, Tenant.contract_number, Tenant.legal_case),
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
        assigned_unit_ids = list(
            {m.assign_property_unit for m in managers if m.assign_property_unit}
        )

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
        print("Searching tenants for user_id:", user_id)
        print("from_date:", from_date)
        print("to_date:", to_date)
        print("status:", status)
        tenants = db.query(Tenant).filter(Tenant.user_id == user_id).all()
        tenant_ids_with_invoices = (
            db.query(Invoice.tenant_id)
            .filter(Invoice.tenant_id.in_([t.id for t in tenants]))
            .distinct()
            .all()
        )
        tenant_ids = [t[0] for t in tenant_ids_with_invoices]
        print("Tenants found:", tenants)
        if not tenants:
            return {
                "success": True,
                "message": "Tenant not found.",
                "total": 0,
                "items": [],
                "total_paid": 0,
            }

        tenant_ids = [t.id for t in tenants]
        print("Tenant IDs:", tenant_ids)
        query = query.filter(Invoice.tenant_id.in_(tenant_ids))

    if from_date:
        from_date = datetime.combine(from_date, time.min)
        query = query.filter(Invoice.created_at >= from_date)

    if to_date:
        to_date = datetime.combine(to_date, time.max)
        query = query.filter(Invoice.created_at <= to_date)

    if status:
        query = query.filter(Invoice.status.ilike(status))

    # if search:
    #     search_term = f"%{search.lower()}%"
    #     query = query.filter(Invoice.invoice_no.ilike(search_term))

    invoices = query.distinct().all()
    total_paid = sum(int(float(inv.total_amount or 0)) for inv in invoices)

    return {
        "success": True,
        "message": "Invoice report fetched successfully.",
        "total": len(invoices),
        "items": invoices,
        "total_paid": total_paid,
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
        unit_ids = list(
            {m.assign_property_unit for m in mans if m.assign_property_unit}
        )
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
        unit_ids = list(
            {m.assign_property_unit for m in mans if m.assign_property_unit}
        )
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
