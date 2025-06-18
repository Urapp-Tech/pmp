from app.models.security_logs import SecurityLog
from sqlalchemy.orm import Session
from uuid import UUID


def log_action(
    db: Session,
    user_id: UUID,
    action_type: str,
    description: str,
    role_name: str,
    ip_address: str = None,
):
    log = SecurityLog(
        user_id=user_id,
        action_type=action_type,
        description=description,
        role_name=role_name,
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()
