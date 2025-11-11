from sqlalchemy.orm import Session, joinedload
from app.models.security_logs import SecurityLog
from typing import Optional
from app.modules.securityLogs.schemas import SecurityLogCreate, SecurityLogOut
from uuid import UUID
from app.models.users import User
from typing import Optional
from sqlalchemy import or_


def log_security_event(db: Session, user_id: UUID, log_data: SecurityLogCreate):
    log = SecurityLog(
        user_id=user_id,
        action=log_data.action,
        description=log_data.description,
        ip_address=log_data.ip_address,
        user_agent=log_data.user_agent,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_security_logs(
    db: Session, page: int = 1, size: int = 20, search: Optional[str] = None
):
    query = db.query(SecurityLog).options(joinedload(SecurityLog.user))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                SecurityLog.action.ilike(search_term),
                SecurityLog.description.ilike(search_term),
                SecurityLog.user.has(User.fname.ilike(search_term)),
                SecurityLog.user.has(User.lname.ilike(search_term)),
            )
        )

    total = query.count()

    logs = (
        query.order_by(SecurityLog.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    items = [
        SecurityLogOut(
            id=log.id,
            user_id=log.user_id,
            user_name=f"{log.user.fname} {log.user.lname}" if log.user else None,
            action=log.action,
            description=log.description,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            created_at=log.created_at,
        )
        for log in logs
    ]

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": items,
    }
