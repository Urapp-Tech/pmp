from sqlalchemy.orm import Session
from app.models.support_tickets import SupportTicket
from app.modules.supportTickets.schemas import SupportTicketCreate
from app.models.users import User
from app.models.roles import Role
from app.models.super_admins import SuperAdmin as SuperUser
from app.models.support_tickets import SupportTicketStatus
from typing import Optional
import uuid


def create_ticket(db: Session, data: SupportTicketCreate):
    sender_role = db.query(Role).filter(Role.id == data.sender_role_id).first()
    if not sender_role:
        raise ValueError("Invalid sender role ID")

    # Prepare base data as dict
    ticket_data = data.model_dump()

    if sender_role.name.lower() == "landlord":
        super_admin = db.query(SuperUser).first()
        if not super_admin:
            raise ValueError("No Super Admin available")

        ticket_data["receiver_id"] = super_admin.id
        ticket_data["receiver_role_id"] = (
            db.query(Role).filter(Role.name == "Super Admin").first().id
        )

    elif sender_role.name.lower() == "user":
        user = db.query(User).filter(User.id == data.sender_id).first()
        if not user or not user.landlord_id:
            raise ValueError("User does not have an assigned landlord")

        landlord = db.query(User).filter(User.id == user.landlord_id).first()
        if not landlord:
            raise ValueError("Landlord not found for this user")

        ticket_data["receiver_id"] = landlord.id
        ticket_data["receiver_role_id"] = (
            db.query(Role).filter(Role.name == "Landlord").first().id
        )

    else:
        raise ValueError("This role is not allowed to create support tickets")

    ticket = SupportTicket(
        id=uuid.uuid4(),
        sender_id=ticket_data["sender_id"],
        sender_role_id=ticket_data["sender_role_id"],
        receiver_id=ticket_data["receiver_id"],
        receiver_role_id=ticket_data["receiver_role_id"],
        subject=ticket_data["subject"],
        message=ticket_data["message"],
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_tickets_by_user(
    db: Session,
    user_id: uuid.UUID,
    role_id: uuid.UUID,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[SupportTicketStatus] = None,
):
    query = db.query(SupportTicket).filter(
        (
            (SupportTicket.sender_id == user_id)
            & (SupportTicket.sender_role_id == role_id)
        )
        | (
            (SupportTicket.receiver_id == user_id)
            & (SupportTicket.receiver_role_id == role_id)
        )
    )

    if search:
        search = f"%{search.lower()}%"
        query = query.filter(
            (SupportTicket.subject.ilike(search))
            | (SupportTicket.message.ilike(search))
        )

    if status:
        query = query.filter(SupportTicket.status == status)

    total = query.count()

    tickets = (
        query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()
    )

    return tickets, total
