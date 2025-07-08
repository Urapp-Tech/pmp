from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.modules.subscriptions.schemas import SubscriptionCreate, SubscriptionOut
from app.modules.subscriptions.services import (
    create_subscription,
    get_active_subscriptions,
)
from app.db.database import get_db

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.post("/", response_model=SubscriptionOut)
def create_new_subscription(
    subscription: SubscriptionCreate, db: Session = Depends(get_db)
):
    return create_subscription(db, subscription)


@router.get("/", response_model=list[SubscriptionOut])
def list_active_subscriptions(db: Session = Depends(get_db)):
    return get_active_subscriptions(db)
