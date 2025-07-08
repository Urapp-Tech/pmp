from sqlalchemy.orm import Session
from app.models.subscriptions import Subscription
from app.modules.subscriptions.schemas import SubscriptionCreate


def create_subscription(db: Session, subscription: SubscriptionCreate):
    new_sub = Subscription(**subscription.dict())
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub


def get_active_subscriptions(db: Session):
    return db.query(Subscription).filter(Subscription.is_active == True).all()
