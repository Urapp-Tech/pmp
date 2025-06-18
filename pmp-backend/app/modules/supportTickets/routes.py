from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from typing import Optional
from app.models.support_tickets import SupportTicketStatus
from app.modules.supportTickets.schemas import (
    SupportTicketCreate,
    SupportTicketOut,
    PaginatedSupportTicketResponse,
)
from app.modules.supportTickets.services import create_ticket, get_tickets_by_user
from typing import List
import uuid

router = APIRouter()


@router.post("/create", response_model=SupportTicketOut)
def create_ticket_route(payload: SupportTicketCreate, db: Session = Depends(get_db)):
    return create_ticket(db, payload)


@router.get("/list/{user_id}/{role_id}", response_model=PaginatedSupportTicketResponse)
def get_user_tickets(
    user_id: uuid.UUID,
    role_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    search: Optional[str] = Query(None),
    status: Optional[SupportTicketStatus] = Query(None),
    db: Session = Depends(get_db),
):
    tickets, total = get_tickets_by_user(
        db=db,
        user_id=user_id,
        role_id=role_id,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
    )
    return PaginatedSupportTicketResponse(
        success=True,
        message="Tickets fetched successfully",
        total=total,
        page=(skip // limit) + 1,
        size=limit,
        items=[SupportTicketOut.model_validate(ticket) for ticket in tickets],
    )
