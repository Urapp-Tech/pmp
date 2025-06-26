from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.landlords import Landlord
from app.models.users import User
from app.models.properties import Property
from app.models.roles import Role
from app.models.support_tickets import SupportTicketStatus, SupportTicket


def get_super_admin_activity_summary(db: Session):
    # Get Super Admin Role ID
    super_admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
    if not super_admin_role:
        return {
            "active_landlords": 0,
            "active_properties": 0,
            "active_tickets": 0,
        }

    # 1. Active Landlords
    active_landlords = (
        db.query(func.count(func.distinct(User.landlord_id)))
        .join(Landlord, Landlord.id == User.landlord_id)
        .filter(
            User.is_landlord == True,
            User.is_verified == True,
            User.landlord_id.isnot(None),
        )
        .scalar()
    )

    # 2. Active Properties
    active_properties = db.query(Property).count()

    # 3. Active Tickets (open/in_progress where receiver is Super Admin)
    active_ticket_statuses = [SupportTicketStatus.open, SupportTicketStatus.in_progress]
    active_tickets = (
        db.query(SupportTicket)
        .filter(
            SupportTicket.receiver_role_id == super_admin_role.id,
            SupportTicket.status.in_(active_ticket_statuses),
        )
        .count()
    )

    return {
        "active_landlords": active_landlords,
        "active_properties": active_properties,
        "active_tickets": active_tickets,
    }
