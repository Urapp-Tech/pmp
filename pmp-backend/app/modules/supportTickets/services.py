from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.support_tickets import SupportTicket
from app.modules.supportTickets.schemas import (
    SupportTicketOut,
    SupportTicketUpdate,
    SupportTicketStatusUpdate,
)
from app.models.users import User
from app.models.landlords import Landlord
from app.models.roles import Role
from app.models.managers import Manager
from app.models.tenants import Tenant
from app.models.super_admins import SuperAdmin as SuperUser
from app.models.support_tickets import SupportTicketStatus
from typing import Optional, List
from app.utils.uploader import is_upload_file, save_uploaded_file
import uuid
from uuid import UUID


# def create_ticket(db: Session, data: SupportTicketCreate):
#     sender_role = db.query(Role).filter(Role.id == data.sender_role_id).first()
#     if not sender_role:
#         raise ValueError("Invalid sender role ID")

#     # Prepare base data as dict
#     ticket_data = data.model_dump()

#     if sender_role.name.lower() == "landlord":
#         super_admin = db.query(SuperUser).first()
#         if not super_admin:
#             raise ValueError("No Super Admin available")

#         ticket_data["receiver_id"] = super_admin.id
#         ticket_data["receiver_role_id"] = (
#             db.query(Role).filter(Role.name == "Super Admin").first().id
#         )

#     elif sender_role.name.lower() == "user":
#         user = db.query(User).filter(User.id == data.sender_id).first()
#         if not user or not user.landlord_id:
#             raise ValueError("User does not have an assigned landlord")

#         landlord = db.query(User).filter(User.id == user.landlord_id).first()
#         if not landlord:
#             raise ValueError("Landlord not found for this user")

#         ticket_data["receiver_id"] = landlord.id
#         ticket_data["receiver_role_id"] = (
#             db.query(Role).filter(Role.name == "Landlord").first().id
#         )

#     else:
#         raise ValueError("This role is not allowed to create support tickets")

#     ticket = SupportTicket(
#         id=uuid.uuid4(),
#         sender_id=ticket_data["sender_id"],
#         sender_role_id=ticket_data["sender_role_id"],
#         receiver_id=ticket_data["receiver_id"],
#         receiver_role_id=ticket_data["receiver_role_id"],
#         subject=ticket_data["subject"],
#         message=ticket_data["message"],
#     )
#     db.add(ticket)
#     db.commit()
#     db.refresh(ticket)
#     return ticket


def create_ticket(db: Session, data, images: Optional[List[UploadFile]] = None):
    sender_id = data.sender_id
    sender_role_id = data.sender_role_id

    sender_role = db.query(Role).filter(Role.id == sender_role_id).first()
    if not sender_role:
        raise HTTPException(status_code=400, detail="Invalid sender role ID")

    ticket_data = {
        "sender_id": sender_id,
        "sender_role_id": sender_role_id,
        "subject": data.subject,
        "message": data.message,
    }

    if sender_role.name.lower() == "landlord":
        super_admin = db.query(SuperUser).first()
        if not super_admin:
            raise HTTPException(status_code=400, detail="No Super Admin found")
        ticket_data["receiver_id"] = super_admin.id
        ticket_data["receiver_role_id"] = (
            db.query(Role).filter(Role.name == "Super Admin").first().id
        )

    elif sender_role.name.lower() == "manager":
        manager = db.query(User).filter(User.id == sender_id).first()
        if not manager or not manager.landlord_id:
            raise HTTPException(status_code=400, detail="Manager has no landlord")
        landlord = db.query(Landlord).filter(Landlord.id == manager.landlord_id).first()
        if not landlord:
            raise HTTPException(status_code=400, detail="Landlord not found")
        ticket_data["receiver_id"] = landlord.id
        ticket_data["receiver_role_id"] = (
            db.query(Role).filter(Role.name == "Landlord").first().id
        )

    elif sender_role.name.lower() == "user":
        user = db.query(User).filter(User.id == sender_id).first()
        if not user or not user.landlord_id:
            raise HTTPException(status_code=400, detail="User has no landlord")
        landlord = db.query(Landlord).filter(Landlord.id == user.landlord_id).first()
        if not landlord:
            raise HTTPException(status_code=400, detail="Landlord not found")
        ticket_data["receiver_id"] = landlord.id
        ticket_data["receiver_role_id"] = (
            db.query(Role).filter(Role.name == "Landlord").first().id
        )

    else:
        raise HTTPException(
            status_code=403, detail="This role is not allowed to create support tickets"
        )

    # Handle image saving
    image_paths = []
    if images:
        for image in images:
            path = save_uploaded_file(image, "uploads/support_tickets")
            image_paths.append(path)

    ticket = SupportTicket(
        id=uuid.uuid4(),
        sender_id=ticket_data["sender_id"],
        sender_role_id=ticket_data["sender_role_id"],
        receiver_id=ticket_data["receiver_id"],
        receiver_role_id=ticket_data["receiver_role_id"],
        subject=ticket_data["subject"],
        message=ticket_data["message"],
        images=image_paths,
    )

    db.add(ticket)
    db.flush()
    db.commit()
    db.refresh(ticket)

    return SupportTicketOut.model_validate(ticket, from_attributes=True).model_dump(
        by_alias=True
    )


def update_ticket(
    db: Session,
    ticket_id: UUID,
    data: SupportTicketUpdate,
    new_images: Optional[List[UploadFile]] = None,
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if data.subject:
        ticket.subject = data.subject
    if data.message:
        ticket.message = data.message

    # Start with existing images
    final_images = ticket.images or []

    # Add new uploaded files if any
    if new_images:
        for file in new_images:
            path = save_uploaded_file(file, "uploads/support_tickets")
            final_images.append(path)

    ticket.images = final_images

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return SupportTicketOut.model_validate(ticket, from_attributes=True).model_dump(
        by_alias=True
    )


def get_tickets_by_user(
    db: Session,
    user_id: uuid.UUID,
    role_id: uuid.UUID,
    role_type: str,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[SupportTicketStatus] = None,
):
    base_condition = and_(
        SupportTicket.sender_id == user_id,
        SupportTicket.sender_role_id == role_id,
        SupportTicket.is_active == True,
    )

    if role_type == "super admin":
        extra_condition = and_(
            SupportTicket.receiver_id == user_id,
            SupportTicket.receiver_role_id == role_id,
            SupportTicket.is_active == True,
        )
        query = db.query(SupportTicket).filter(or_(base_condition, extra_condition))
    else:
        query = db.query(SupportTicket).filter(base_condition)

    if search:
        search = f"%{search.lower()}%"
        query = query.filter(
            (SupportTicket.subject.ilike(search))
            | (SupportTicket.message.ilike(search))
        )

    if status not in [None, ""]:
        try:
            status_enum = SupportTicketStatus(status)
            query = query.filter(SupportTicket.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    total = query.count()

    tickets = (
        query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()
    )

    return tickets, total


def update_ticket_status_service(db: Session, data: SupportTicketStatusUpdate):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == data.ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    ticket.status = data.status
    db.commit()
    db.refresh(ticket)

    return {
        "success": True,
        "message": f"Ticket status updated to '{ticket.status}' successfully",
        "ticket_id": str(ticket.id),
        "new_status": ticket.status,
    }


def get_landlord_reported_tickets_from_subusers(
    db: Session,
    landlord_id: UUID,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
):
    # Step 1: Verify landlord exists
    landlord = db.query(Landlord).filter(Landlord.id == landlord_id).first()
    if not landlord:
        raise HTTPException(status_code=404, detail="Landlord not found")

    # Step 2: Get Role IDs for 'Manager' and 'User'
    roles = db.query(Role.id).filter(Role.name.in_(["Manager", "User"])).all()
    allowed_role_ids = [r.id for r in roles]
    if not allowed_role_ids:
        raise HTTPException(status_code=400, detail="No valid roles found")

    # Step 3: Get user IDs under this landlord with allowed roles
    sub_users = (
        db.query(User.id)
        .filter(User.landlord_id == landlord_id, User.role_id.in_(allowed_role_ids))
        .subquery()
    )

    # Step 4: Join SupportTicket with User
    query = (
        db.query(
            SupportTicket,
            User.id.label("user_id"),
            User.fname,
            User.lname,
            Role.name.label("role_name"),
        )
        .join(User, SupportTicket.sender_id == User.id)
        .join(Role, User.role_id == Role.id)
        .filter(
            SupportTicket.sender_id.in_(sub_users),
            SupportTicket.receiver_id == landlord_id,
            SupportTicket.is_active == True,
        )
    )

    # Step 5: Search (optional)
    if search:
        search = f"%{search.lower()}%"
        query = query.filter(
            or_(
                SupportTicket.subject.ilike(search), SupportTicket.message.ilike(search)
            )
        )

    # Step 6: Status (optional)
    if status not in [None, ""]:
        try:
            status_enum = SupportTicketStatus(status)
            query = query.filter(SupportTicket.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    # Step 7: Count and paginate
    total = query.count()
    results = (
        query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit).all()
    )

    # Step 8: Format response
    tickets = []

    for ticket, user_id, fname, lname, role_name in results:
        ticket_dict = ticket.__dict__.copy()
        ticket_dict["user_id"] = user_id
        ticket_dict["first_name"] = fname
        ticket_dict["last_name"] = lname
        ticket_dict["role_name"] = role_name
        ticket_dict.pop("_sa_instance_state", None)
        tickets.append(ticket_dict)

    return tickets, total


def get_reported_tickets_based_on_role(
    db: Session,
    user_id: UUID,
    role_type: str,
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
):
    role_type = role_type.capitalize()
    if role_type not in ["Landlord", "Manager"]:
        raise HTTPException(status_code=400, detail="Invalid roleType")

    tickets_query = (
        db.query(
            SupportTicket,
            User.id.label("user_id"),
            User.fname,
            User.lname,
            Role.name.label("role_name"),
        )
        .join(User, SupportTicket.sender_id == User.id)
        .join(Role, User.role_id == Role.id)
        .filter(SupportTicket.is_active == True)
    )

    if role_type == "Landlord":
        landlord = db.query(Landlord).filter(Landlord.id == user_id).first()
        if not landlord:
            raise HTTPException(status_code=404, detail="Landlord not found")

        # ✅ Step 2: Check if corresponding user is valid (active, verified, marked as landlord)
        landlord_user = (
            db.query(User)
            .filter(
                User.landlord_id == landlord.id,
                User.is_verified == True,
                User.is_landlord == True,
                User.is_active == True,
            )
            .first()
        )

        if not landlord_user:
            raise HTTPException(
                status_code=403,
                detail="Landlord user is not active, verified, or properly marked",
            )

        # Step 3: Get sub-users (Managers + Users) under this landlord
        allowed_roles = (
            db.query(Role.id).filter(Role.name.in_(["Manager", "User"])).subquery()
        )

        sub_user_ids = (
            db.query(User.id)
            .filter(
                User.landlord_id == landlord.id,
                User.role_id.in_(allowed_roles),
            )
            .subquery()
        )

        tickets_query = tickets_query.filter(
            SupportTicket.sender_id.in_(sub_user_ids),
            SupportTicket.receiver_id == landlord_user.landlord_id,
        )

    elif role_type == "Manager":
        # Step 1: Get manager from users table
        manager = db.query(User).filter(User.id == user_id).first()
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")

        # Step 2: Get role ID of "User"
        user_role_id = db.query(Role.id).filter(Role.name == "User").scalar_subquery()

        # Step 3: Get sub-users (only Users) under same landlord
        sub_user_ids = (
            db.query(User.id)
            .filter(
                User.landlord_id == manager.landlord_id,
                User.role_id == user_role_id,
                User.is_active == True,
            )
            .subquery()
        )

        # Step 4: Filter support tickets
        tickets_query = tickets_query.filter(
            SupportTicket.sender_id.in_(sub_user_ids),
            SupportTicket.receiver_id == manager.landlord_id,
            SupportTicket.is_active == True,
        )

    # Apply search filter
    if search:
        search_term = f"%{search.lower()}%"
        tickets_query = tickets_query.filter(
            or_(
                SupportTicket.subject.ilike(search_term),
                SupportTicket.message.ilike(search_term),
            )
        )

    # Apply status filter
    if status:
        try:
            status_enum = SupportTicketStatus(status)
            tickets_query = tickets_query.filter(SupportTicket.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

    # Paginate
    total = tickets_query.count()
    results = (
        tickets_query.order_by(SupportTicket.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    # Format response
    tickets = []
    for ticket, user_id, fname, lname, role_name in results:
        ticket_dict = ticket.__dict__.copy()
        ticket_dict["user_id"] = user_id
        ticket_dict["first_name"] = fname
        ticket_dict["last_name"] = lname
        ticket_dict["role_name"] = role_name
        ticket_dict.pop("_sa_instance_state", None)
        tickets.append(ticket_dict)

    return tickets, total


def delete_ticket(db: Session, ticket_id: str):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.is_active is False:
        raise HTTPException(status_code=400, detail="Ticket already deleted")

    ticket.is_active = False
    db.commit()
    return {"success": True, "message": "Ticket deleted successfully"}
