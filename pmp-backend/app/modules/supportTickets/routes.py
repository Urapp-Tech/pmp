from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from app.db.database import get_db
from typing import Optional, List
from pydantic import ValidationError
from uuid import UUID
from app.models.support_tickets import SupportTicketStatus
from app.modules.supportTickets.schemas import (
    SupportTicketCreate,
    SupportTicketOut,
    SupportTicketResponse,
    PaginatedSupportTicketResponse,
    SupportTicketUpdate,
    SupportTicketStatusUpdate,
)
from app.modules.supportTickets.services import (
    create_ticket,
    get_tickets_by_user,
    update_ticket,
    delete_ticket,
    update_ticket_status_service,
    get_landlord_reported_tickets_from_subusers,
)
from typing import List
import uuid

router = APIRouter()


def parse_support_ticket_create(
    senderId: UUID = Form(...),
    senderRoleId: UUID = Form(...),
    subject: str = Form(...),
    message: str = Form(...),
    images: Optional[List[UploadFile]] = File(default=None),
):

    try:
        if not images:
            images = []

        ticket_data = SupportTicketCreate(
            senderId=senderId,
            senderRoleId=senderRoleId,
            subject=subject,
            message=message,
        )

        return {"ticket_data": ticket_data, "images": images}
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())


def parse_support_ticket_update(
    subject: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    new_images: Optional[List[UploadFile]] = File(default=None),
):
    try:
        update_data = SupportTicketUpdate(subject=subject, message=message)
        return {"update_data": update_data, "new_images": new_images}
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())


@router.post("/create", response_model=SupportTicketResponse)
def create_ticket_route(
    parsed: dict = Depends(parse_support_ticket_create),
    db: Session = Depends(get_db),
):
    ticket = create_ticket(db, parsed["ticket_data"], parsed["images"])
    return {
        "success": True,
        "message": "Ticket created successfully",
        "items": ticket,
    }


@router.post("/update/{ticket_id}", response_model=SupportTicketResponse)
def update_ticket_route(
    ticket_id: UUID,
    parsed: dict = Depends(parse_support_ticket_update),
    db: Session = Depends(get_db),
):
    ticket = update_ticket(
        db=db,
        ticket_id=ticket_id,
        data=parsed["update_data"],
        new_images=parsed["new_images"],
    )
    return {
        "success": True,
        "message": "Ticket updated successfully",
        "items": ticket,
    }


@router.get("/list/{user_id}/{role_id}", response_model=PaginatedSupportTicketResponse)
def get_user_tickets(
    user_id: uuid.UUID,
    role_id: uuid.UUID,
    role_type: Optional[str] = Query(None, alias="roleType"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):

    if role_type:
        role_type = role_type.strip().lower()

    status_enum = None
    if status not in [None, ""]:
        try:
            status_enum = SupportTicketStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    tickets, total = get_tickets_by_user(
        db=db,
        user_id=user_id,
        role_id=role_id,
        role_type=role_type,
        skip=skip,
        limit=limit,
        search=search,
        status=status_enum,
    )
    return PaginatedSupportTicketResponse(
        success=True,
        message="Tickets fetched successfully",
        total=total,
        page=(skip // limit) + 1,
        size=limit,
        items=[SupportTicketOut.model_validate(ticket) for ticket in tickets],
    )


@router.post("/update-status")
def update_ticket_status(
    status_data: SupportTicketStatusUpdate,
    db: Session = Depends(get_db),
):
    return update_ticket_status_service(db, status_data)


@router.get("/landlord-tickets/{landlord_id}")
def list_landlord_user_tickets(
    landlord_id: UUID,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    tickets, total = get_landlord_reported_tickets_from_subusers(
        db=db,
        landlord_id=landlord_id,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
    )
    return {
        "success": True,
        "message": "Tickets retrieved successfully",
        "total": total,
        "items": tickets,
    }


@router.post("/delete/{id}")
def delete_ticket_by_id(id: UUID, db: Session = Depends(get_db)):
    return delete_ticket(db, str(id))
