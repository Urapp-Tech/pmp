from typing import Optional, List, Dict, Any
from math import ceil
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, cast, String, Numeric

from app.models.invoices import Invoice
from app.models.users import User
from app.models.manual_payments import ManualPayment
from app.models.tenants import Tenant
from app.models.properties import Property
from app.models.property_units import PropertyUnit

MANUAL_VALUES = ("manual", "manuel")  # tolerate common typo


def _attachments_from_docs(docs: Any) -> List[Dict[str, Any]]:
    if not docs:
        return []
    try:
        atts = docs.get("attachments") or []
        out = []
        for a in atts:
            if not isinstance(a, dict):
                continue
            out.append(
                {
                    "url": a.get("url"),
                    "mime": a.get("mime"),
                    "name": a.get("name"),
                    "size": a.get("size"),
                }
            )
        return out
    except AttributeError:
        return []


def _coerce_dt(val: Any) -> Optional[datetime]:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        s = val.strip()
        s_try = s.replace(" ", "T") if " " in s and "T" not in s else s
        if s_try.endswith("+00"):  # normalize '+00' -> '+00:00'
            s_try = s_try + ":00"
        try:
            return datetime.fromisoformat(s_try)
        except Exception:
            try:
                if "+" in s_try:
                    s_try = s_try.split("+", 1)[0]
                return datetime.fromisoformat(s_try)
            except Exception:
                return None
    return None


def collections_report(
    db: Session,
    landlord_id: UUID,
    page: int = 1,
    page_size: int = 20,
    q: Optional[str] = None,
):
    # Case-insensitive comparisons for enum/text
    STATUS = func.lower(cast(Invoice.status, String))
    SUBTYPE = func.lower(cast(Invoice.submitted_type, String))

    # Common filter: only invoices with invoice_no starting with "inv-"
    INV_PREFIX_FILTER = (
        Invoice.invoice_no.isnot(None),
        Invoice.invoice_no.ilike("inv-%"),  # <-- NEW
    )

    # ---------- KPI cards ----------
    # 1) total_collection = count of paid + auto, invoice_no like 'inv-%'
    total_collection = (
        db.query(func.count(Invoice.id))
        .filter(
            Invoice.landlord_id == landlord_id,
            STATUS == "paid",
            SUBTYPE == "auto",
            *INV_PREFIX_FILTER,  # <-- NEW
        )
        .scalar()
        or 0
    )

    # 2) received_amount = sum(paid_amount) for paid + manual/manuel, invoice_no like 'inv-%'
    received_amount = (
        db.query(func.coalesce(func.sum(cast(Invoice.paid_amount, Numeric)), 0))
        .filter(
            Invoice.landlord_id == landlord_id,
            STATUS == "paid",
            SUBTYPE.in_(MANUAL_VALUES),
            *INV_PREFIX_FILTER,  # <-- NEW
        )
        .scalar()
        or 0
    )
    received_amount = float(received_amount)

    # 3) pending_amount = sum(total_amount) for paid + auto, invoice_no like 'inv-%'
    pending_amount = (
        db.query(func.coalesce(func.sum(cast(Invoice.total_amount, Numeric)), 0))
        .filter(
            Invoice.landlord_id == landlord_id,
            STATUS == "paid",
            SUBTYPE == "auto",
            *INV_PREFIX_FILTER,  # <-- NEW
        )
        .scalar()
        or 0
    )
    pending_amount = float(pending_amount)

    # ---------- Table base query ----------
    # Invoice -> Tenant (tenant_id), Tenant -> PropertyUnit (property_unit_id), PropertyUnit -> Property
    base = (
        db.query(Invoice, Tenant, User, PropertyUnit, Property)
        .outerjoin(Tenant, Tenant.id == Invoice.tenant_id)
        .outerjoin(User, User.id == Tenant.user_id)
        .outerjoin(PropertyUnit, PropertyUnit.id == Tenant.property_unit_id)
        .outerjoin(Property, Property.id == PropertyUnit.property_id)
        .filter(
            Invoice.landlord_id == landlord_id,
            STATUS == "paid",  # both auto & manual/manuel in table
            *INV_PREFIX_FILTER,  # <-- NEW: exclude 'SUB-' etc.
        )
    )

    if q:
        like = f"%{q.strip()}%"
        base = base.filter(or_(User.fname.ilike(like), User.lname.ilike(like)))

    total = base.with_entities(func.count(Invoice.id)).scalar() or 0

    rows = (
        base.order_by(
            Invoice.payment_date.desc().nullslast(),
            Invoice.created_at.desc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Attachments from manual_payments (group by invoice)
    invoice_ids = [inv.id for (inv, *_rest) in rows if inv and inv.id]
    att_map: Dict[str, List[Dict[str, Any]]] = {}
    if invoice_ids:
        mps = (
            db.query(ManualPayment)
            .filter(ManualPayment.invoice_id.in_(invoice_ids))
            .all()
        )
        tmp: Dict[str, List[Dict[str, Any]]] = {}
        for mp in mps:
            k = str(mp.invoice_id)
            tmp.setdefault(k, []).extend(_attachments_from_docs(mp.docs))
        # De-dup by (url, name)
        for k, v in tmp.items():
            seen, uniq = set(), []
            for a in v:
                key = (a.get("url"), a.get("name"))
                if key in seen:
                    continue
                seen.add(key)
                uniq.append(a)
            att_map[k] = uniq

    items = []
    for inv, tenant, user, unit, prop in rows:
        subtype_val = (getattr(inv, "submitted_type", "") or "").lower()
        status_label = "Received" if subtype_val in MANUAL_VALUES else "Pending"
        tenant_name = None
        if user:
            tenant_name = (
                f"{(user.fname or '').strip()} {(user.lname or '').strip()}".strip()
                or None
            )

        items.append(
            {
                "invoice_id": inv.id,
                "invoice_no": inv.invoice_no,
                "property_name": getattr(prop, "name", None),
                "unit_no": getattr(unit, "unit_no", None),
                "tenant_name": tenant_name,
                "payment_date": _coerce_dt(getattr(inv, "payment_date", None)),
                "rent": float((getattr(inv, "total_amount", 0) or 0)),
                "status": status_label,
                "attachments": att_map.get(str(inv.id), []),
            }
        )

    return {
        "items": items,
        "page": page,
        "pageSize": page_size,
        "total": total,
        "totalPages": ceil(total / page_size) if page_size else 0,
        "success": True,
        "totals": {
            "total_collection": int(total_collection),
            "received_amount": received_amount,
            "pending_amount": pending_amount,
        },
    }
