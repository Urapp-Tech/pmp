from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.db.database import get_db
from app.modules.subscriptions.schemas import (
    # Subscriptions CRUD
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionOut,
    # Subscribed Landlords flow
    LandlordSubscribeRequest,
    SubscribedLandlordOut,
    AdminApproveRequest,
    AdminRejectRequest,
    AdminUpdateRequest,
    RenewalPaidRequest,
    CancelRequest,
)
from app.modules.subscriptions import services

router = APIRouter(prefix="/subscriptions", tags=["Admin - Subscriptions"])

# =========================
# Subscriptions (CRUD)
# =========================


@router.post("/create", response_model=SubscriptionOut)
def create_new_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db)):
    try:
        return services.create_subscription(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/list")
def list_subscriptions(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=200),
    q: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
):
    """
    Paginated subscriptions (plans).
    Returns: { items: [...], page, pageSize, total, totalPages, success }
    """
    return services.list_subscriptions(
        db, page=page, page_size=pageSize, q=q, is_active=is_active
    )


# @router.get("/{subscription_id}", response_model=SubscriptionOut)
# def get_subscription(subscription_id: UUID, db: Session = Depends(get_db)):
#     sub = services.get_subscription(db, subscription_id)
#     if not sub:
#         raise HTTPException(status_code=404, detail="Subscription not found")
#     return sub


@router.put("/update/{subscription_id}", response_model=SubscriptionOut)
def update_subscription(
    subscription_id: UUID, payload: SubscriptionUpdate, db: Session = Depends(get_db)
):
    try:
        return services.update_subscription(db, subscription_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/deactivate/{subscription_id}", response_model=SubscriptionOut)
def deactivate_subscription(subscription_id: UUID, db: Session = Depends(get_db)):
    try:
        return services.deactivate_subscription(db, subscription_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# =========================
# Subscribed Landlords
# =========================

subr = APIRouter(prefix="/subscribed-landlords", tags=["Subscribed Landlords"])


@subr.get("/list")
def list_subscribed_landlords(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=200),
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(
        None, pattern="^(pending|approved|rejected|cancelled)$"
    ),
    landlord_id: Optional[str] = Query(None),  # or UUID if you prefer
    subscription_id: Optional[str] = Query(None),  # or UUID if you prefer
    db: Session = Depends(get_db),
):
    """
    Paginated subscribed_landlords.
    Filters: q (plan_name/status), status, landlord_id, subscription_id.
    Returns: { items: [...], page, pageSize, total, totalPages, success }
    """
    return services.list_subscribed_landlords(
        db,
        page=page,
        page_size=pageSize,
        q=q,
        status=status,
        landlord_id=landlord_id,
        subscription_id=subscription_id,
    )


@subr.post("/{landlord_id}", response_model=SubscribedLandlordOut)
def landlord_subscribe(
    landlord_id: UUID,
    body: LandlordSubscribeRequest,
    db: Session = Depends(get_db),
):
    try:
        rec = services.landlord_subscribe(
            db, landlord_id, body.subscription_id, body.holding_properties
        )
        return rec
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@subr.post("/approve/{record_id}", response_model=SubscribedLandlordOut)
def admin_approve(
    record_id: UUID,
    body: AdminApproveRequest,
    db: Session = Depends(get_db),
    admin_user_id: Optional[UUID] = None,  # replace with current_user.id from auth
):
    if not admin_user_id:
        raise HTTPException(status_code=400, detail="admin_user_id required")
    try:
        rec = services.admin_approve(
            db, record_id, admin_user_id, body.discounted_amount, body.expiration_date
        )
        return rec
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@subr.post("/reject/{record_id}", response_model=SubscribedLandlordOut)
def admin_reject(
    record_id: UUID,
    body: AdminRejectRequest,
    db: Session = Depends(get_db),
    admin_user_id: Optional[UUID] = None,
):
    if not admin_user_id:
        raise HTTPException(status_code=400, detail="admin_user_id required")
    try:
        rec = services.admin_reject(db, record_id, admin_user_id)
        return rec
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@subr.post("/update/{record_id}", response_model=SubscribedLandlordOut)
def admin_update(
    record_id: UUID,
    body: AdminUpdateRequest,
    db: Session = Depends(get_db),
    admin_user_id: Optional[UUID] = None,
):
    try:
        rec = services.admin_update(
            db,
            record_id,
            holding_properties=body.holding_properties,
            total_amount=body.total_amount,
            discounted_amount=body.discounted_amount,
            due_amount=body.due_amount,
        )
        return rec
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Maintenance/cron endpoints (≤3 flow)
@subr.post("/maintenance/generate-payment-links")
def generate_payment_links(
    days_before: int = Query(7, ge=1, le=60), db: Session = Depends(get_db)
):
    updated = services.generate_payment_links_for_upcoming_expiry(
        db, days_before=days_before
    )
    return {"updated": updated, "daysBefore": days_before}


@subr.post("/maintenance/expire-and-deactivate")
def expire_and_deactivate(db: Session = Depends(get_db)):
    processed = services.expire_and_deactivate_properties(db)
    return {"processed": processed}


@subr.post("/{record_id}/renewal-paid", response_model=SubscribedLandlordOut)
def renewal_paid(
    record_id: UUID,
    body: RenewalPaidRequest,
    db: Session = Depends(get_db),
):
    try:
        rec = services.mark_renewal_paid_and_extend(
            db, record_id, extend_days=body.extend_days
        )
        return rec
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@subr.post("/cancel/{record_id}", response_model=SubscribedLandlordOut)
def cancel_subscription(
    record_id: UUID,
    body: Optional[CancelRequest] = None,
    db: Session = Depends(get_db),
    current_user_id: Optional[UUID] = None,  # pass auth user if you have it
):
    try:
        rec = services.cancel_subscription(
            db,
            record_id,
            cancelled_by=current_user_id,
            reason=(body.reason if body else None),
        )
        return rec
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# mount the sub-router
router.include_router(subr)
