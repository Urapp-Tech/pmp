from __future__ import annotations
from sqlalchemy.orm import Session, load_only
from sqlalchemy import update, insert, Table, MetaData, func, or_
from sqlalchemy.exc import SQLAlchemyError
from decimal import Decimal
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
from math import ceil
import requests

from app.models.subscriptions import Subscription
from app.models.subscribed_landlord import SubscribedLandlord
from app.models.users import User
from app.models.payment_history import PaymentHistory
from app.models.landlords import Landlord
from app.models.invoices import Invoice

from app.core.config import settings

# ---------- MyFatoorah helpers ----------
MYFATOORAH_API_URL = settings.MYFATOORAH_API_URL
MYFATOORAH_API_KEY = settings.MYFATOORAH_API_KEY


def _mf_headers():
    return {
        "Authorization": f"Bearer {MYFATOORAH_API_KEY}",
        "Content-Type": "application/json",
    }


def _mf(path: str) -> str:
    return f"{MYFATOORAH_API_URL.rstrip('/')}/{path.lstrip('/')}"


# ---------- common helpers ----------
def _dec(v) -> Decimal:
    if v is None:
        return Decimal("0")
    if isinstance(v, Decimal):
        return v
    return Decimal(str(v).replace(",", "").strip())


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _expiry(days: int) -> datetime:
    return _now() + timedelta(days=int(days))


def _generate_invoice_no() -> str:
    # Replace with your own invoice number strategy if you have one (sequence, etc.)
    # This one is readable + unique enough for most setups.
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"SUB-{ts}"


def _ensure_subscription_invoice(
    db: Session, *, rec: SubscribedLandlord, user: User, plan: Subscription
) -> UUID:
    now = _now()

    total_amount = float(_dec(rec.total_amount))
    discount_amount = float(_dec(rec.discounted_amount))
    due_amount = float(
        max(
            Decimal("0"),
            _dec(
                rec.due_amount
                if rec.due_amount is not None
                else _dec(rec.total_amount) - _dec(rec.discounted_amount)
            ),
        )
    )
    currency = plan.currency or "KWD"

    inv = Invoice(
        landlord_id=rec.landlord_id,
        tenant_id=None,
        invoice_no=_generate_invoice_no(),
        total_amount=total_amount,  # <-- total
        paid_amount=0.0,
        discount_amount=discount_amount,
        due_amount=due_amount,  # <-- due
        currency=currency,
        status="unpaid",
        submitted_type="auto",
        payment_date=None,
        invoice_date=now,
        due_date=rec.expiration_date or (now + timedelta(days=7)),
        description=f"Subscription - {rec.plan_name or 'Plan'}",
        payment_method=None,
        qty=1,
        created_by=user.id,
        updated_by=user.id,
    )

    try:
        db.add(inv)
        db.commit()
        db.refresh(inv)
        return inv.id
    except SQLAlchemyError as e:
        db.rollback()
        raise Exception(f"Failed to create subscription invoice: {e}")


# ============================================================
# Subscriptions (CRUD): create, update, soft-deactivate, list
# ============================================================


def create_subscription(db: Session, payload) -> Subscription:
    sub = Subscription(
        plan_name=payload.plan_name,
        description=payload.description,
        amount=float(_dec(payload.amount)),
        currency=payload.currency or "KWD",
        duration_in_days=payload.duration_in_days,
        is_active=True,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def update_subscription(db: Session, subscription_id: UUID, payload) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise ValueError("Subscription not found")

    if payload.plan_name is not None:
        sub.plan_name = payload.plan_name
    if payload.description is not None:
        sub.description = payload.description
    if payload.amount is not None:
        sub.amount = float(_dec(payload.amount))
    if payload.currency is not None:
        sub.currency = payload.currency
    if payload.duration_in_days is not None:
        sub.duration_in_days = int(payload.duration_in_days)

    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def deactivate_subscription(db: Session, subscription_id: UUID) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise ValueError("Subscription not found")
    sub.is_active = False
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def list_subscriptions(
    db,
    page: int = 1,
    page_size: int = 20,
    q: Optional[str] = None,
    is_active: Optional[bool] = True,  # default: show only active plans
) -> Dict[str, Any]:
    """
    Paginated list of subscription plans with optional search and active filter.
    Search (q): plan_name, description, currency (ILIKE).
    """
    page = max(1, int(page))
    page_size = max(1, min(int(page_size), 200))

    query = db.query(Subscription)

    if is_active is not None:
        query = query.filter(Subscription.is_active == bool(is_active))

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Subscription.plan_name.ilike(like),
                Subscription.description.ilike(like),
                Subscription.currency.ilike(like),
            )
        )

    # Accurate total (before pagination)
    count_sq = query.order_by(None).with_entities(Subscription.id).subquery()
    total = db.query(func.count()).select_from(count_sq).scalar() or 0

    rows: List[Subscription] = (
        query.order_by(Subscription.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        {
            "id": r.id,
            "plan_name": r.plan_name,
            "description": r.description,
            "amount": r.amount,
            "currency": r.currency,
            "duration_in_days": r.duration_in_days,
            "is_active": r.is_active,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        }
        for r in rows
    ]

    return {
        "items": items,
        "page": page,
        "pageSize": page_size,
        "total": total,
        "totalPages": ceil(total / page_size) if page_size else 0,
        "success": True,
    }


def get_subscription(db: Session, subscription_id: UUID) -> Optional[Subscription]:
    return db.query(Subscription).filter(Subscription.id == subscription_id).first()


# ============================================================
# Subscribed Landlords flow
# ============================================================

# constants
PAYMENT_STATUS = {
    "PENDING": "PENDING",
    "PAID": "PAID",
    "FAILED": "FAILED",
}
UNPAID_STATES = {PAYMENT_STATUS["PENDING"]}


def _latest_unpaid_subscription_payment(db, plan_id: UUID, user_id: UUID):
    return (
        db.query(PaymentHistory)
        .filter(
            PaymentHistory.payment_type == "SUBSCRIPTION",
            PaymentHistory.subscription_id == plan_id,
            PaymentHistory.user_id == user_id,
            PaymentHistory.status.in_(UNPAID_STATES),
        )
        .order_by(PaymentHistory.created_at.desc())
        .first()
    )


def _supersede_unpaid(db, ph: PaymentHistory, reason: str):
    ph.status = PAYMENT_STATUS["FAILED"]  # <-- was "FAIL"
    ph.updated_at = func.now()  # <-- was 'now()' string
    # optionally store reason in a JSON meta field if you have one
    db.add(ph)


def _rotate_mf_payment_link(db, rec: SubscribedLandlord, new_amount: Decimal):
    user = _get_landlord_user(db, rec.landlord_id)
    old = _latest_unpaid_subscription_payment(db, rec.subscription_id, user.id)
    if old:
        _supersede_unpaid(db, old, "Reissued after admin update")
    new_ph = _create_subscription_payment_history(db, rec, amount_override=new_amount)
    rec.payment_link = new_ph.payment_url
    db.add(rec)
    return new_ph


def list_subscribed_landlords(
    db,
    page: int = 1,
    page_size: int = 10,
    q: Optional[str] = None,  # search in plan_name and status
    status: Optional[str] = None,  # pending|approved|rejected
    landlord_id: Optional[str] = None,  # filter by landlord
    subscription_id: Optional[str] = None,  # filter by plan
) -> Dict[str, Any]:
    """
    Paginated list of subscribed_landlords with filters and landlord_name (from users).
    Uses a correlated subquery to avoid duplicates caused by multiple users per landlord.
    """
    page = max(1, int(page))
    page_size = max(1, min(int(page_size), 200))

    # Base filtered query (used for COUNT to avoid any join duplicates)
    base_q = db.query(SubscribedLandlord)

    if status:
        base_q = base_q.filter(SubscribedLandlord.status.ilike(status))

    if landlord_id:
        base_q = base_q.filter(SubscribedLandlord.landlord_id == landlord_id)

    if subscription_id:
        base_q = base_q.filter(SubscribedLandlord.subscription_id == subscription_id)

    if q:
        like = f"%{q}%"
        base_q = base_q.filter(
            or_(
                SubscribedLandlord.plan_name.ilike(like),
                SubscribedLandlord.status.ilike(like),
            )
        )

    # Accurate total BEFORE pagination
    count_sq = base_q.order_by(None).with_entities(SubscribedLandlord.id).subquery()
    total = db.query(func.count()).select_from(count_sq).scalar() or 0

    # ---- Correlated subquery for landlord_name (pick ONE landlord user) ----
    landlord_name_subq = (
        db.query(
            func.trim(
                func.concat_ws(
                    " ", func.coalesce(User.fname, ""), func.coalesce(User.lname, "")
                )
            )
        )
        .filter(
            User.landlord_id == SubscribedLandlord.landlord_id, User.is_landlord == True
        )
        .order_by(User.created_at.desc())  # pick most recently created landlord user
        .limit(1)
        .correlate(SubscribedLandlord)
        .scalar_subquery()
    )

    # Fetch page rows with the landlord_name subquery
    rows = (
        base_q.with_entities(
            SubscribedLandlord,
            landlord_name_subq.label("landlord_name"),
        )
        .order_by(SubscribedLandlord.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = []
    for rec, landlord_name in rows:
        name = (landlord_name or "").strip() or None
        items.append(
            {
                "id": rec.id,
                "landlord_id": rec.landlord_id,
                "landlord_name": name,
                "subscription_id": rec.subscription_id,
                "plan_name": rec.plan_name,
                "holding_properties": rec.holding_properties,
                "total_amount": str(rec.total_amount),
                "discounted_amount": str(rec.discounted_amount),
                "due_amount": str(rec.due_amount),
                "status": rec.status,
                "approved_by": rec.approved_by,
                "expiration_date": rec.expiration_date,
                "payment_link": rec.payment_link,
                "created_at": rec.created_at,
                "updated_at": rec.updated_at,
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


def _pick_payment_method(amount: float, currency_iso: str) -> int:
    """Call MyFatoorah InitiatePayment and choose a suitable method (prefer card)."""
    ip_resp = requests.post(
        _mf("InitiatePayment"),
        json={"InvoiceAmount": float(amount), "CurrencyIso": currency_iso},
        headers=_mf_headers(),
        timeout=30,
    )
    ip_json = ip_resp.json()
    ip_resp.raise_for_status()
    if not ip_json.get("IsSuccess"):
        raise Exception(ip_json.get("Message") or "InitiatePayment failed")

    methods = (ip_json.get("Data") or {}).get("PaymentMethods") or []
    if not methods:
        raise Exception("No payment methods enabled for this account/currency.")

    def _norm(x: str) -> str:
        return (x or "").strip().lower()

    chosen = None
    for m in methods:
        name_en = _norm(m.get("PaymentMethodEn", ""))
        code = _norm(m.get("PaymentMethodCode", ""))
        if (
            "visa" in name_en
            or "master" in name_en
            or "card" in name_en
            or code in {"cc", "v-m"}
        ):
            chosen = m
            break
    chosen = chosen or methods[0]
    return chosen["PaymentMethodId"]


def _get_landlord_user(db: Session, landlord_id: UUID) -> User:
    user = (
        db.query(User)
        .filter(User.landlord_id == landlord_id, User.is_landlord == True)
        .options(load_only(User.id, User.email, User.fname, User.lname))
        .first()
    )
    if not user:
        raise Exception("No user found for this landlord.")
    return user


def _create_subscription_payment_history(
    db: Session, rec: SubscribedLandlord, *, amount_override: Optional[Decimal] = None
) -> PaymentHistory:
    plan = db.query(Subscription).filter(Subscription.id == rec.subscription_id).first()
    if not plan:
        raise Exception("Plan not found for subscription payment.")

    user = _get_landlord_user(db, rec.landlord_id)
    customer_name = (
        f"{(user.fname or '').strip()} {(user.lname or '').strip()}".strip()
        or "Landlord"
    )
    customer_email = (user.email or "").strip()

    # internal invoice (your FK)
    invoice_id = _ensure_subscription_invoice(db, rec=rec, user=user, plan=plan)

    # amount to charge (use override if given)
    amount = float(
        _dec(
            amount_override
            if amount_override is not None
            else (rec.due_amount if rec.due_amount is not None else rec.total_amount)
        )
    )
    if amount <= 0:
        raise ValueError("Nothing to charge; amount is 0")

    currency_iso = plan.currency or "KWD"

    payment_method_id = _pick_payment_method(amount, currency_iso)

    payload = {
        "PaymentMethodId": payment_method_id,
        "CustomerName": customer_name,
        "CustomerEmail": customer_email,
        "CustomerReference": str(invoice_id),
        "UserDefinedField": str(user.id),
        "NotificationOption": "EML",
        "CallBackUrl": f"{settings.BACKEND_BASE_URL}/admin/payments/callback",
        "ErrorUrl": f"{settings.BACKEND_BASE_URL}/admin/payments/error",
        "Language": "en",
        "InvoiceValue": amount,
    }

    ep_resp = requests.post(
        _mf("ExecutePayment"), json=payload, headers=_mf_headers(), timeout=30
    )
    ep_json = ep_resp.json()
    ep_resp.raise_for_status()
    if not ep_json.get("IsSuccess"):
        raise Exception(ep_json.get("Message") or "ExecutePayment failed")

    invoice_url = ep_json["Data"]["PaymentURL"]
    mf_invoice_id = ep_json["Data"]["InvoiceId"]

    row = PaymentHistory(
        invoice_id=str(invoice_id),
        user_id=user.id,
        # TIP: prefer linking to the *instance* (subscribed_landlords.id):
        # keeps history unambiguous; you also handle planId elsewhere anyway.
        subscription_id=rec.subscription_id,
        property_unit_id=None,
        payload=ep_json,
        payment_id=str(mf_invoice_id),
        amount=amount,
        currency=currency_iso,
        payment_type="SUBSCRIPTION",
        payment_url=invoice_url,
        status="PENDING",
    )
    db.add(row)
    rec.payment_link = invoice_url
    db.add(rec)

    db.commit()
    db.refresh(row)
    return row


def landlord_subscribe(
    db: Session, landlord_id: UUID, subscription_id: UUID, holding_properties: int
) -> SubscribedLandlord:
    landlord = db.query(Landlord).filter(Landlord.id == landlord_id).first()
    if not landlord:
        raise ValueError("Landlord not found")

    plan = (
        db.query(Subscription)
        .filter(Subscription.id == subscription_id, Subscription.is_active == True)
        .first()
    )
    if not plan:
        raise ValueError("Subscription plan not found or inactive")

    unit_price = _dec(plan.amount)
    hp = int(holding_properties)
    total = unit_price * Decimal(hp)  # <-- unit × holdings
    disc = Decimal("0")
    due = total - disc

    status = "approved" if hp <= 3 else "pending"
    exp = _expiry(int(plan.duration_in_days)) if status == "approved" else None

    rec = SubscribedLandlord(
        landlord_id=landlord.id,
        subscription_id=plan.id,
        plan_name=plan.plan_name,
        holding_properties=hp,
        total_amount=total,
        discounted_amount=disc,
        due_amount=max(Decimal("0"), due),
        status=status,
        expiration_date=exp,
        payment_link=None,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    if status == "approved":
        # Create invoice + MF payment link for the computed amount (due_amount)
        _create_subscription_payment_history(db, rec)

    return rec


def admin_approve(
    db: Session,
    subscribed_landlord_id: UUID,
    admin_user_id: UUID,
    discounted_amount: Decimal = Decimal("0"),
    expiration_date: Optional[datetime] = None,
) -> SubscribedLandlord:
    rec = (
        db.query(SubscribedLandlord)
        .filter(SubscribedLandlord.id == subscribed_landlord_id)
        .first()
    )
    if not rec:
        raise ValueError("Subscription request not found")

    if (rec.status or "").lower() == "cancelled":
        raise ValueError("Cancelled subscription cannot be approved")

    plan = db.query(Subscription).filter(Subscription.id == rec.subscription_id).first()
    if not plan:
        raise ValueError("Plan not found")

    # Ensure total_amount reflects unit × holdings
    unit_price = _dec(plan.amount)
    rec.total_amount = unit_price * Decimal(int(rec.holding_properties))

    disc = _dec(discounted_amount or 0)
    rec.discounted_amount = disc
    rec.due_amount = max(
        Decimal("0"), _dec(rec.total_amount) - disc
    )  # <-- do NOT overwrite total

    rec.status = "approved"
    rec.approved_by = admin_user_id
    rec.expiration_date = expiration_date or _expiry(int(plan.duration_in_days))

    db.add(rec)
    db.commit()
    db.refresh(rec)

    if not rec.payment_link:
        _create_subscription_payment_history(db, rec)

    return rec


def admin_reject(
    db: Session, subscribed_landlord_id: UUID, admin_user_id: UUID
) -> SubscribedLandlord:
    rec = (
        db.query(SubscribedLandlord)
        .filter(SubscribedLandlord.id == subscribed_landlord_id)
        .first()
    )
    if not rec:
        raise ValueError("Subscription request not found")
    rec.status = "rejected"
    rec.approved_by = admin_user_id
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def admin_update(
    db: Session,
    subscribed_landlord_id: UUID,
    *,
    holding_properties: Optional[int] = None,
    total_amount: Optional[Decimal] = None,
    discounted_amount: Optional[Decimal] = None,
    due_amount: Optional[Decimal] = None,
) -> SubscribedLandlord:
    rec = (
        db.query(SubscribedLandlord)
        .filter(SubscribedLandlord.id == subscribed_landlord_id)
        .first()
    )
    if not rec:
        raise ValueError("Subscription record not found")

    if (rec.status or "").lower() == "cancelled":
        raise ValueError("Cancelled subscription cannot be updated")

    plan = db.query(Subscription).filter(Subscription.id == rec.subscription_id).first()

    prior_due = _dec(rec.due_amount or 0)

    if holding_properties is not None:
        rec.holding_properties = int(holding_properties)

    if total_amount is not None:
        rec.total_amount = _dec(total_amount)
    else:
        if plan:
            unit_price = _dec(plan.amount)
            rec.total_amount = unit_price * Decimal(int(rec.holding_properties or 0))

    if discounted_amount is not None:
        rec.discounted_amount = _dec(discounted_amount)

    if due_amount is not None:
        rec.due_amount = _dec(due_amount)
    else:
        rec.due_amount = max(
            Decimal("0"), _dec(rec.total_amount) - _dec(rec.discounted_amount)
        )

    db.add(rec)
    db.flush()  # ensure latest amounts for link rotation

    new_due = _dec(rec.due_amount or 0)

    if new_due != prior_due:
        # Use PLAN id + landlord user to scope payments to this landlord+plan
        user = _get_landlord_user(db, rec.landlord_id)

        latest_ph_any = (
            db.query(PaymentHistory)
            .filter(
                PaymentHistory.payment_type == "SUBSCRIPTION",
                PaymentHistory.subscription_id == rec.subscription_id,  # PLAN ID
                PaymentHistory.user_id == user.id,
            )
            .order_by(PaymentHistory.created_at.desc())
            .first()
        )
        latest_status = (
            str(latest_ph_any.status).upper()
            if latest_ph_any and latest_ph_any.status
            else None
        )

        if latest_status == PAYMENT_STATUS["PAID"]:
            # already settled; if you need adjustments, handle via refund/credit outside
            pass
        else:
            if new_due <= Decimal("0"):
                # nothing to pay: FAIL any pending and clear link
                unpaid = _latest_unpaid_subscription_payment(
                    db, rec.subscription_id, user.id
                )  # plan id
                if unpaid:
                    _supersede_unpaid(
                        db, unpaid, "Zero due after update"
                    )  # sets status="FAIL"
                rec.payment_link = None
                db.add(rec)
            else:
                # rotate MF link for new amount (helper FAILs old PENDING)
                _rotate_mf_payment_link(
                    db, rec, new_amount=new_due
                )  # uses plan id internally

    db.commit()
    db.refresh(rec)
    return rec


# ---------------------------
# Renewal / Maintenance (≤3)
# ---------------------------


def generate_payment_links_for_upcoming_expiry(
    db: Session, days_before: int = 7
) -> int:
    """
    For approved subs with holding_properties ≤ 3:
    If expiration_date within N days and payment_link is empty -> create a NEW invoice/payment link
    and insert a PaymentHistory row (PENDING) for this subscription charge.
    """
    now = _now()
    horizon = now + timedelta(days=days_before)
    rows = (
        db.query(SubscribedLandlord)
        .filter(
            SubscribedLandlord.status == "approved",
            SubscribedLandlord.holding_properties <= 3,
            SubscribedLandlord.expiration_date.isnot(None),
            SubscribedLandlord.expiration_date <= horizon,
        )
        .all()
    )
    updated = 0
    for rec in rows:
        if not rec.payment_link:
            _create_subscription_payment_history(db, rec)
            updated += 1
    return updated


def mark_renewal_paid_and_extend(
    db: Session, subscribed_landlord_id: UUID, extend_days: Optional[int] = None
) -> SubscribedLandlord:
    """
    Called after successful renewal payment (your payments webhook already set payment_history.status=PAID).
    If active, extend from current expiration_date; if expired, extend from now. Clears payment_link.
    """
    rec = (
        db.query(SubscribedLandlord)
        .filter(SubscribedLandlord.id == subscribed_landlord_id)
        .first()
    )
    if not rec:
        raise ValueError("Subscription not found")

    plan = db.query(Subscription).filter(Subscription.id == rec.subscription_id).first()
    if not plan:
        raise ValueError("Plan not found")

    add_days = extend_days if extend_days is not None else int(plan.duration_in_days)
    base = _now()
    if rec.expiration_date and rec.expiration_date > base:
        new_exp = rec.expiration_date + timedelta(days=add_days)
    else:
        new_exp = base + timedelta(days=add_days)

    rec.expiration_date = new_exp
    rec.payment_link = None
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def expire_and_deactivate_properties(db: Session) -> int:
    """
    For approved subs (≤3) where expiration_date < now and not renewed,
    set the landlord's properties to inactive (status false).
    Adjust the properties table/column names once below.
    """
    now = _now()
    expired = (
        db.query(SubscribedLandlord)
        .filter(
            SubscribedLandlord.status == "approved",
            SubscribedLandlord.holding_properties <= 3,
            SubscribedLandlord.expiration_date.isnot(None),
            SubscribedLandlord.expiration_date < now,
        )
        .all()
    )

    # Adjust to your real properties table & column names.
    meta = MetaData(bind=db.bind)
    properties = Table(
        "properties", meta, autoload_with=db.bind
    )  # expects columns landlord_id, is_active

    count = 0
    for rec in expired:
        db.execute(
            update(properties)
            .where(properties.c.landlord_id == rec.landlord_id)
            .values(is_active=False)  # or status=False, depending on your schema
        )
        count += 1

    if count:
        db.commit()
    return count


def cancel_subscription(
    db: Session,
    record_id: UUID,
    *,
    cancelled_by: Optional[UUID] = None,
    reason: Optional[str] = None,
) -> SubscribedLandlord:
    rec = (
        db.query(SubscribedLandlord).filter(SubscribedLandlord.id == record_id).first()
    )
    if not rec:
        raise ValueError("Subscription not found")

    # If already cancelled, return as-is
    if (rec.status or "").lower() == "cancelled":
        return rec

    # If rejected, nothing to cancel
    if (rec.status or "").lower() == "rejected":
        raise ValueError("Subscription is rejected; nothing to cancel")

    # Fail any unpaid MF link for this landlord+plan
    user = _get_landlord_user(db, rec.landlord_id)
    pending_ph = _latest_unpaid_subscription_payment(db, rec.subscription_id, user.id)
    if pending_ph:
        _supersede_unpaid(db, pending_ph, reason or "Cancelled by user/admin")

    # Finalize the record
    rec.status = "cancelled"
    rec.payment_link = None
    rec.due_amount = Decimal("0")
    rec.expiration_date = _now()  # stop immediately

    # Optional: store who cancelled (reuse approved_by if you like, or add a new column later)
    if cancelled_by:
        rec.approved_by = (
            cancelled_by  # or a dedicated cancelled_by column if you add one
        )

    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
