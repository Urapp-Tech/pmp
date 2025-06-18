from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from app.core.security import get_current_user, has_roles
from app.models.users import User
from typing import List
from typing import Optional
from app.db.database import SessionLocal, get_db
from app.modules.securityLogs.schemas import (
    SecurityLogCreate,
    SecurityLogOut,
    SecurityLogListResponse,
)
from app.modules.securityLogs.services import (
    log_security_event,
    get_security_logs,
)


router = APIRouter()


@router.get("/logs", response_model=SecurityLogListResponse)
def fetch_logs(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user: User = Depends(has_roles(["Super Admin"])),
):
    return get_security_logs(db=db, page=page, size=size, search=search)


@router.post("/")
def create_log(
    log: SecurityLogCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Normally used internally, e.g. during login/logout
    log.ip_address = request.client.host
    log.user_agent = request.headers.get("user-agent")
    return log_security_event(db, user_id=current_user.id, log_data=log)
