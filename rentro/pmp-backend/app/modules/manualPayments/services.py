from __future__ import annotations
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, select, false
from uuid import UUID
from uuid import UUID as UUID_type
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Union
from math import ceil

from fastapi import UploadFile

from app.models.invoices import Invoice
from app.models.users import User
from app.models.landlords import Landlord
from app.models.manual_payments import ManualPayment
from app.models.super_admins import SuperAdmin

from app.utils.uploader import save_uploaded_file, is_upload_file  # <- your util

# ---------- helpers ----------


def _dec(v) -> Decimal:
    if v is None:
        return Decimal("0")
    if isinstance(v, Decimal):
        return v
    return Decimal(str(v).replace(",", "").strip())


def _now():
    return datetime.now(timezone.utc)


_ALLOWED_MIME = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def _build_docs_json(
    existing: Optional[Dict[str, Any]], files: Optional[List[UploadFile]]
):
    docs = existing.copy() if isinstance(existing, dict) else {}
    attachments = list(docs.get("attachments") or [])
    if not isinstance(attachments, list):
        attachments = []

    if files:
        for f in files:
            if not is_upload_file(f):
                continue
            # optional: validate mime
            if f.content_type and f.content_type not in _ALLOWED_MIME:
                # skip or accept anyway; here we accept anyway
                pass
            rel_path = save_uploaded_file(f, upload_dir="uploads/manual_payments")
            attachments.append(
                {
                    "url": rel_path,
                    "mime": f.content_type or "application/octet-stream",
                    "name": f.filename or "file",
                    "size": getattr(f.file, "len", None) or None,
                }
            )

    if attachments:
        docs["attachments"] = attachments
    return docs or None


def _landlord_name_from_payment(db: Session, p: ManualPayment) -> Optional[str]:
    # If landlord_id present, pick newest landlord user's name
    if p.landlord_id:
        row = (
            db.query(User.fname, User.lname)
            .filter(User.landlord_id == p.landlord_id, User.is_landlord == True)
            .order_by(User.created_at.desc())
            .first()
        )
        if row:
            fname, lname = row
            name = (
                " ".join(x for x in [(fname or "").strip(), (lname or "").strip()] if x)
                or None
            )
            return name

    # Else if user_id present, use that user's name (commonly a landlord user)
    if p.user_id:
        u = db.query(User).filter(User.id == p.user_id).first()
        if u:
            name = (
                " ".join(
                    x for x in [(u.fname or "").strip(), (u.lname or "").strip()] if x
                )
                or None
            )
            return name

    return None


# ---------- core services ----------


def create_manual_payment(
    db: Session,
    payload,  # ManualPaymentCreate
    actor_role: str,  # "superadmin" | "landlord"
    actor_id: UUID,  # super_admin.id OR user.id
    files: Optional[List[UploadFile]] = None,
):
    inv: Invoice = db.query(Invoice).filter(Invoice.id == payload.invoice_id).first()
    if not inv:
        raise ValueError("Invoice not found")

    amount = _dec(payload.amount)
    if amount <= 0:
        raise ValueError("Amount must be greater than zero")

    currency = payload.currency or (inv.currency or "KWD")
    docs_json = _build_docs_json(payload.docs, files)

    # who is acting (sets landlord_id/user_id/submitted_by)
    landlord_id = None
    user_id = None
    submitted_by = None

    role_norm = (actor_role or "").strip().lower()
    if role_norm == "superadmin":
        landlord_id = inv.landlord_id
        submitted_by = actor_id
    elif role_norm == "landlord":
        user = (
            db.query(User)
            .filter(User.landlord_id == actor_id, User.is_landlord == True)
            .first()
        )
        if not user:
            raise ValueError("Landlord user not found")
        if not user.is_landlord or not user.landlord_id:
            raise ValueError("Provided user is not a landlord user")
        user_id = user.id
        submitted_by = user.landlord_id
    else:
        raise ValueError("actor_role must be 'superadmin' or 'landlord'")

    row = ManualPayment(
        invoice_id=inv.id,
        landlord_id=landlord_id,
        user_id=user_id,
        amount=amount,
        currency=currency,
        method=payload.method,
        deposit_reference=payload.deposit_reference,
        deposit_date=payload.deposit_date,
        notes=payload.notes,
        docs=docs_json,
        submitted_by=submitted_by,
    )
    db.add(row)

    # 🔧 ALWAYS mark invoice as manual when a manual payment entry is created
    inv.submitted_type = "manual"

    # Optionally mark as paid
    if payload.mark_as_paid:
        total_amount = _dec(inv.total_amount)
        discount = _dec(inv.discount_amount)
        inv.paid_amount = float(max(Decimal("0"), total_amount - discount))
        inv.due_amount = float(Decimal("0"))
        inv.status = "paid"
        inv.payment_date = _now()

    # Make sure invoice state is tracked for update
    db.add(inv)

    db.commit()
    db.refresh(row)

    invoice_no = getattr(inv, "invoice_no", None)
    landlord_name = _landlord_name_from_payment(db, row)

    out = {
        "id": row.id,
        "invoice_id": row.invoice_id,
        "landlord_id": row.landlord_id,
        "user_id": row.user_id,
        "amount": float(row.amount),
        "currency": row.currency,
        "method": row.method,
        "deposit_reference": row.deposit_reference,
        "deposit_date": row.deposit_date,
        "notes": row.notes,
        "docs": row.docs,
        "submitted_by": row.submitted_by,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
        "invoice_no": invoice_no,
        "landlord_name": landlord_name,
    }
    return {"items": out, "success": True, "msg": "Manual payment created"}


def _norm_docs(d: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not d:
        return {"attachments": []}
    atts = d.get("attachments") or []
    if not isinstance(atts, list):
        atts = []
    return {"attachments": atts}


def _coerce_docs(
    docs: Optional[Union[Dict[str, Any], "DocsOut"]],
) -> Optional[Dict[str, Any]]:
    if docs is None:
        return None
    try:
        return docs.model_dump()  # pydantic v2
    except AttributeError:
        pass
    try:
        return docs.dict()  # pydantic v1
    except AttributeError:
        pass
    return docs  # assume dict-like


def _is_non_empty_upload_file(f: UploadFile) -> bool:
    """
    Robust non-empty check: require filename and >0 bytes (seek or 1-byte peek).
    """
    if not getattr(f, "filename", ""):
        return False
    try:
        f.file.seek(0, 2)
        size = f.file.tell()
        f.file.seek(0)
        if size > 0:
            return True
    except Exception:
        pass
    # fallback: peek 1 byte
    try:
        b = f.file.read(1)
        f.file.seek(0)
        return bool(b)
    except Exception:
        return False


def _files_to_docs(files: Optional[List[UploadFile]]) -> Dict[str, Any]:
    if not files:
        return {"attachments": []}

    attachments: List[Dict[str, Any]] = []

    # Process each file independently; skip empties so a single bad file doesn't break the batch
    for f in files:
        if not _is_non_empty_upload_file(f):
            continue
        try:
            # Use your existing helper to create attachment objects for THIS file
            produced = _build_docs_json(
                {}, [f]
            )  # should return {"attachments":[{...}]}
            atts = produced.get("attachments") or []
            if isinstance(atts, list):
                attachments.extend(atts)
        except RuntimeError as e:
            # Tolerate only the 'empty' case; re-raise others
            if "empty" in str(e).lower():
                continue
            raise

    return {"attachments": attachments}


def update_manual_payment(
    db: Session,
    payment_id: UUID,
    payload,  # ManualPaymentUpdate
    files: Optional[List[UploadFile]] = None,
) -> Dict[str, Any]:
    row = db.query(ManualPayment).filter(ManualPayment.id == payment_id).first()
    if not row:
        raise ValueError("Payment record not found")

    inv: Optional[Invoice] = None

    # --- field updates (unchanged) ---
    if payload.invoice_id is not None:
        inv = db.query(Invoice).filter(Invoice.id == payload.invoice_id).first()
        if not inv:
            raise ValueError("Invoice not found")
        row.invoice_id = inv.id

    if payload.amount is not None:
        amt = _dec(payload.amount)
        if amt <= 0:
            raise ValueError("Amount must be greater than zero")
        row.amount = amt

    if payload.currency is not None:
        if not payload.currency:
            raise ValueError("Currency cannot be empty")
        row.currency = payload.currency

    if payload.method is not None:
        row.method = payload.method

    if payload.deposit_reference is not None:
        row.deposit_reference = payload.deposit_reference

    if payload.deposit_date is not None:
        row.deposit_date = payload.deposit_date

    if payload.notes is not None:
        row.notes = payload.notes

    # --- DOCS MERGE LOGIC (append; {} with no files = no change) ---
    existing_docs = _norm_docs(_coerce_docs(row.docs))
    is_docs_explicit_empty = isinstance(payload.docs, dict) and len(payload.docs) == 0

    has_files = bool(files)
    if (payload.docs is None or is_docs_explicit_empty) and not has_files:
        # No change requested
        pass
    else:
        merged_atts = list(existing_docs["attachments"])

        # Append incoming docs.attachments (if provided and not just {})
        if payload.docs is not None and not is_docs_explicit_empty:
            incoming_docs = _norm_docs(_coerce_docs(payload.docs))
            merged_atts.extend(incoming_docs["attachments"])

        # Append file attachments (skip empty files inside helper)
        if has_files:
            file_docs = _files_to_docs(files)
            merged_atts.extend(file_docs["attachments"])

        # De-duplicate by (url, name)
        seen = set()
        deduped = []
        for a in merged_atts:
            key = (a.get("url"), a.get("name"))
            if key in seen:
                continue
            seen.add(key)
            deduped.append(a)

        row.docs = {"attachments": deduped}

    db.add(row)

    # --- invoice side effects (unchanged) ---
    if not inv:
        inv = db.query(Invoice).filter(Invoice.id == row.invoice_id).first()

    if inv:
        inv.submitted_type = "manual"
        if payload.mark_as_paid:
            total_amount = _dec(inv.total_amount)
            discount = _dec(inv.discount_amount)
            inv.paid_amount = float(max(Decimal("0"), total_amount - discount))
            inv.due_amount = 0.0
            inv.status = "paid"
            inv.payment_date = _now()
        db.add(inv)

    db.commit()
    db.refresh(row)
    if inv:
        db.refresh(inv)

    invoice_no = getattr(inv, "invoice_no", None) if inv else None
    landlord_name = _landlord_name_from_payment(db, row)

    return {
        "id": row.id,
        "invoice_id": row.invoice_id,
        "landlord_id": row.landlord_id,
        "user_id": row.user_id,
        "amount": float(row.amount),
        "currency": row.currency,
        "method": row.method,
        "deposit_reference": row.deposit_reference,
        "deposit_date": row.deposit_date,
        "notes": row.notes,
        "docs": row.docs,  # preserved or merged
        "submitted_by": row.submitted_by,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
        "invoice_no": invoice_no,
        "landlord_name": landlord_name,
    }


# def list_manual_payments(
#     db: Session,
#     page: int = 1,
#     page_size: int = 20,
#     q: Optional[str] = None,
#     landlord_id: Optional[str] = None,
#     user_id: Optional[str] = None,
#     invoice_id: Optional[str] = None,
#     date_from: Optional[datetime] = None,
#     date_to: Optional[datetime] = None,
# ):
#     page = max(1, int(page))
#     page_size = max(1, min(int(page_size), 200))

#     base = db.query(ManualPayment)

#     if landlord_id:
#         base = base.filter(ManualPayment.landlord_id == landlord_id)
#     if user_id:
#         base = base.filter(ManualPayment.user_id == user_id)
#     if invoice_id:
#         base = base.filter(ManualPayment.invoice_id == invoice_id)
#     if date_from:
#         base = base.filter(ManualPayment.created_at >= date_from)
#     if date_to:
#         base = base.filter(ManualPayment.created_at <= date_to)
#     if q:
#         like = f"%{q}%"
#         base = base.join(Invoice, Invoice.id == ManualPayment.invoice_id).filter(
#             or_(
#                 ManualPayment.deposit_reference.ilike(like),
#                 ManualPayment.notes.ilike(like),
#                 Invoice.invoice_no.ilike(like),
#             )
#         )

#     count_sq = base.order_by(None).with_entities(ManualPayment.id).subquery()
#     total = db.query(func.count()).select_from(count_sq).scalar() or 0

#     rows: List[ManualPayment] = (
#         base.order_by(ManualPayment.created_at.desc())
#         .offset((page - 1) * page_size)
#         .limit(page_size)
#         .all()
#     )

#     # Prefetch invoices
#     inv_ids = {r.invoice_id for r in rows if r.invoice_id}
#     inv_map = {}
#     if inv_ids:
#         invs = db.query(Invoice).filter(Invoice.id.in_(list(inv_ids))).all()
#         inv_map = {x.id: x for x in invs}

#     items = []
#     for r in rows:
#         inv = inv_map.get(r.invoice_id)
#         landlord_name = _landlord_name_from_payment(db, r)
#         items.append(
#             {
#                 "id": r.id,
#                 "invoice_id": r.invoice_id,
#                 "landlord_id": r.landlord_id,
#                 "user_id": r.user_id,
#                 "amount": float(r.amount),
#                 "currency": r.currency,
#                 "method": r.method,
#                 "deposit_reference": r.deposit_reference,
#                 "deposit_date": r.deposit_date,
#                 "notes": r.notes,
#                 "docs": r.docs,
#                 "submitted_by": r.submitted_by,
#                 "created_at": r.created_at,
#                 "updated_at": r.updated_at,
#                 "invoice_no": getattr(inv, "invoice_no", None) if inv else None,
#                 "landlord_name": landlord_name,
#             }
#         )

#     return {
#         "items": items,
#         "page": page,
#         "pageSize": page_size,
#         "total": total,
#         "totalPages": ceil(total / page_size) if page_size else 0,
#         "success": True,
#     }


def _to_uuid(value: Optional[str]) -> Optional[UUID_type]:
    if not value:
        return None
    try:
        return uuid.UUID(str(value))
    except Exception:
        return None


def list_manual_payments(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    q: Optional[str] = None,
    landlord_id: Optional[str] = None,
    user_id: Optional[str] = None,
    invoice_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    role: Optional[str] = None,
    actor_id: Optional[str] = None,
):
    page = max(1, int(page))
    page_size = max(1, min(int(page_size), 200))

    base = db.query(ManualPayment)

    # ---------------------------
    # STRICT role-based scoping
    # ---------------------------
    role_norm = (role or "").strip().lower()
    actor_uuid = _to_uuid(actor_id)

    if role_norm in ("superadmin", "landlord"):
        if not actor_uuid:
            # Role specified but no actor provided -> return empty result
            base = base.filter(false())
        else:
            # Hard filter ONLY by submitted_by == actor_id
            base = base.filter(ManualPayment.submitted_by == actor_uuid)

            # (Optional validation — uncomment if you want to enforce existence)
            # if role_norm == "superadmin":
            #     exists_sa = db.query(SuperAdmin.id).filter(SuperAdmin.id == actor_uuid).first()
            #     if not exists_sa:
            #         base = base.filter(false())
            # elif role_norm == "landlord":
            #     exists_ll = db.query(User.id).filter(
            #         User.landlord_id == actor_uuid,
            #         User.is_landlord == True
            #     ).first()
            #     if not exists_ll:
            #         base = base.filter(false())

    # ---------------------------
    # Optional extra filters
    # ---------------------------
    if user_id:
        uid = _to_uuid(user_id)
        if uid:
            base = base.filter(ManualPayment.user_id == uid)

    if landlord_id:
        # This is a simple landlord_id column filter (NOT broadening submitted_by anymore)
        lid = _to_uuid(landlord_id)
        if lid:
            base = base.filter(ManualPayment.landlord_id == lid)

    if invoice_id:
        iid = _to_uuid(invoice_id)
        if iid:
            base = base.filter(ManualPayment.invoice_id == iid)

    # Date filters against created_at
    if date_from:
        base = base.filter(ManualPayment.created_at >= date_from)
    if date_to:
        base = base.filter(ManualPayment.created_at <= date_to)

    # Search
    if q:
        like = f"%{q}%"
        base = base.join(Invoice, Invoice.id == ManualPayment.invoice_id).filter(
            or_(
                ManualPayment.deposit_reference.ilike(like),
                ManualPayment.notes.ilike(like),
                Invoice.invoice_no.ilike(like),
            )
        )

    # ---------------------------
    # Accurate total & paging
    # ---------------------------
    count_sq = base.order_by(None).with_entities(ManualPayment.id).subquery()
    total = db.query(func.count()).select_from(count_sq).scalar() or 0

    rows: List[ManualPayment] = (
        base.order_by(ManualPayment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Prefetch invoices for invoice_no
    inv_ids = {r.invoice_id for r in rows if r.invoice_id}
    inv_map: Dict[Any, Invoice] = {}
    if inv_ids:
        invs = db.query(Invoice).filter(Invoice.id.in_(list(inv_ids))).all()
        inv_map = {x.id: x for x in invs}

    items: List[Dict[str, Any]] = []
    for r in rows:
        inv = inv_map.get(r.invoice_id)
        landlord_name = _landlord_name_from_payment(db, r)
        items.append(
            {
                "id": r.id,
                "invoice_id": r.invoice_id,
                "landlord_id": r.landlord_id,
                "user_id": r.user_id,
                "amount": float(r.amount),
                "currency": r.currency,
                "method": r.method,
                "deposit_reference": r.deposit_reference,
                "deposit_date": r.deposit_date,
                "notes": r.notes,
                "docs": r.docs,
                "submitted_by": r.submitted_by,
                "created_at": r.created_at,
                "updated_at": r.updated_at,
                "invoice_no": getattr(inv, "invoice_no", None) if inv else None,
                "landlord_name": landlord_name,
            }
        )

    return {
        "items": items,
        "page": page,
        "pageSize": page_size,
        "total": total,
        "totalPages": ceil(total / page_size) if page_size else 0,
        "success": True,
    }


def invoices_lov_paid(
    db: Session,
    q: Optional[str] = None,
    landlord_id: Optional[str] = None,
):
    like = f"%{q}%" if q else None

    query = db.query(Invoice).filter(
        func.lower(Invoice.status) == "paid",
        Invoice.invoice_no.isnot(None),
        Invoice.invoice_no.ilike("inv-%"),
        Invoice.submitted_type == "auto",  # only auto
    )

    if landlord_id:
        query = query.filter(Invoice.landlord_id == landlord_id)

    if like:
        query = query.filter(Invoice.invoice_no.ilike(like))

    rows = query.order_by(Invoice.invoice_date.desc().nullslast()).limit(200).all()

    items = [{"id": r.id, "name": r.invoice_no} for r in rows if r.invoice_no]
    return {"items": items, "success": True}


def unpaid_invoices_lov(
    db: Session,
    q: Optional[str] = None,
    landlord_id: Optional[str] = None,
):
    like = f"%{q}%" if q else None

    query = db.query(Invoice).filter(
        func.lower(Invoice.status) == "unpaid",  # only unpaid
        Invoice.invoice_no.isnot(None),
        Invoice.invoice_no.ilike("inv-%"),
        Invoice.submitted_type == "auto",  # only auto
    )

    if landlord_id:
        query = query.filter(Invoice.landlord_id == landlord_id)

    if like:
        query = query.filter(Invoice.invoice_no.ilike(like))

    rows = query.order_by(Invoice.invoice_date.desc().nullslast()).limit(200).all()

    items = [{"id": r.id, "name": r.invoice_no} for r in rows if r.invoice_no]
    return {"items": items, "success": True}
