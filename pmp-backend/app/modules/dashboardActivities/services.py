from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from app.models.landlords import Landlord
from app.models.users import User
from app.models.properties import Property
from app.models.roles import Role
from app.models.managers import Manager
from app.models.tenants import Tenant
from app.models.invoices import Invoice, InvoiceStatus
from app.models.property_units import PropertyUnit
from app.models.support_tickets import SupportTicketStatus, SupportTicket
from collections import defaultdict
from datetime import datetime, timedelta, timezone


def get_super_admin_activity_summary(db: Session):
    # Get Super Admin Role
    super_admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
    if not super_admin_role:
        return {
            "active_tenants": 0,
            "active_requests": 0,
            "current_month_unpaid_invoices": 0,
            "current_month_paid_receipts": 0,
        }

    # Current month boundaries
    now = datetime.now(timezone.utc)
    first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    next_month = (first_day.replace(day=28) + timedelta(days=4)).replace(day=1)

    # 4. Active Tenants
    active_tenants = (
        db.query(User)
        .join(Role, Role.id == User.role_id)
        .filter(User.is_active == True, Role.name == "User")
        .count()
    )

    # 5. Active Requests (support tickets)
    active_requests = (
        db.query(SupportTicket)
        .filter(SupportTicket.is_active == True, SupportTicket.status != "closed")
        .count()
    )

    # 6. Unpaid/Overdue Invoices (current month)
    unpaid_statuses = ["unpaid", "overdue"]
    current_month_unpaid_invoices = (
        db.query(Invoice)
        .filter(
            Invoice.status.in_(unpaid_statuses),
            Invoice.created_at >= first_day,
            Invoice.created_at < next_month,
        )
        .count()
    )

    # 7. Paid Receipts (current month)
    current_month_paid_receipts = (
        db.query(Invoice)
        .filter(
            Invoice.status == "paid",
            Invoice.created_at >= first_day,
            Invoice.created_at < next_month,
        )
        .count()
    )

    return {
        "activeTenants": active_tenants,
        "activeRequests": active_requests,
        "currentMonthUnpaidInvoices": current_month_unpaid_invoices,
        "currentMonthPaidReceipts": current_month_paid_receipts,
    }


def get_landlord_activity_summary(db: Session, landlord_id: UUID):
    # Step 1: Count Total Properties
    total_properties = (
        db.query(func.count(Property.id))
        .filter(Property.landlord_id == landlord_id)
        .scalar()
    )

    # Step 2: Get 'User' Role ID (Tenant)
    user_role = db.query(Role).filter(Role.name == "User").first()
    user_role_id = user_role.id if user_role else None

    # Step 3: Count Active Tenants (Verified, Active, role = User)
    active_tenants = (
        db.query(func.count(User.id))
        .filter(
            User.landlord_id == landlord_id,
            User.role_id == user_role_id,
            User.is_active == True,
        )
        .scalar()
    )

    # Step 4: Count Pending Invoices
    pending_invoices = (
        db.query(func.count(Invoice.id))
        .filter(
            Invoice.landlord_id == landlord_id,
            Invoice.status == InvoiceStatus.un_paid,
        )
        .scalar()
    )

    # Step 5: Count Unresolved Support Tickets (Receiver is landlord)
    unresolved_tickets = (
        db.query(func.count(SupportTicket.id))
        .filter(
            SupportTicket.receiver_id == landlord_id,
            SupportTicket.status.in_(
                [SupportTicketStatus.open, SupportTicketStatus.in_progress]
            ),
        )
        .scalar()
    )

    # Final Response
    return {
        "total_properties": total_properties,
        "active_tenant_users": active_tenants,
        "pending_invoices": pending_invoices,
        "unresolved_tickets": unresolved_tickets,
    }


def get_manager_stats(db: Session, landlord_id: UUID, user_id: UUID) -> dict:
    # 1. Validate Manager Role
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role.name != "Manager":
        raise HTTPException(status_code=403, detail="User is not a manager")

    # 2. Validate landlord link
    if str(user.landlord_id) != str(landlord_id):
        raise HTTPException(
            status_code=403, detail="Manager does not belong to this landlord"
        )

    # 3. Get all assigned unit IDs from manager table
    manager_units = (
        db.query(Manager.assign_property_unit)
        .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
        .distinct()
        .all()
    )
    assigned_unit_ids = [
        row.assign_property_unit for row in manager_units if row.assign_property_unit
    ]

    if not assigned_unit_ids:
        return {
            "success": True,
            "message": "Manager has no assigned units",
            "data": {
                "properties_managed": 0,
                "units": {
                    "total": 0,
                    "available": 0,
                    "occupied": 0,
                },
                "tenants_assigned": 0,
            },
        }

    # 4. Get units data
    units = db.query(PropertyUnit).filter(PropertyUnit.id.in_(assigned_unit_ids)).all()

    total_unit_count = len(units)
    available_unit_count = sum(1 for unit in units if unit.status == "available")
    occupied_unit_count = sum(1 for unit in units if unit.status == "occupied")

    # 5. Count unique properties from those units
    unique_property_ids = set(unit.property_id for unit in units)
    properties_managed_count = len(unique_property_ids)

    # 6. Count tenant users assigned to these units
    tenants_count = (
        db.query(User)
        .filter(
            User.role.has(name="User"),
            Tenant.property_unit_id.in_(assigned_unit_ids),
            User.is_active == True,
            User.landlord_id == landlord_id,
        )
        .count()
    )

    # 7. Return data
    return {
        "success": True,
        "message": "Manager stats fetched successfully",
        "data": {
            "properties_managed": properties_managed_count,
            "units": {
                "total": total_unit_count,
                "available": available_unit_count,
                "occupied": occupied_unit_count,
            },
            "tenants_assigned": tenants_count,
        },
    }


def get_tenant_stats(db: Session, user_id: UUID):
    # Step 1: Validate user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Step 2: Get approved tenant assignments
    approved_tenants = (
        db.query(Tenant)
        .filter(Tenant.user_id == user_id, Tenant.is_approved == True)
        .all()
    )

    if not approved_tenants:
        return {
            "user": {},
            "properties": [],
        }
        # raise HTTPException(
        #     status_code=404, detail="No approved unit assignments found"
        # )

    # Step 3: Organize data
    property_map = {}  # property_id -> property data
    units_by_property = defaultdict(list)

    for tenant in approved_tenants:
        unit = (
            db.query(PropertyUnit)
            .filter(PropertyUnit.id == tenant.property_unit_id)
            .first()
        )
        if unit and unit.status:  # optional: check if unit is active
            property_obj = (
                db.query(Property).filter(Property.id == unit.property_id).first()
            )
            if property_obj:
                prop_id = str(property_obj.id)

                # Only once store property data
                if prop_id not in property_map:
                    prop_data = property_obj.__dict__.copy()
                    prop_data.pop("_sa_instance_state", None)
                    prop_data["units"] = []
                    property_map[prop_id] = prop_data

                # Add unit under the corresponding property
                unit_data = unit.__dict__.copy()
                unit_data.pop("_sa_instance_state", None)
                units_by_property[prop_id].append(unit_data)

    # Attach units to properties
    for prop_id, units in units_by_property.items():
        property_map[prop_id]["units"] = units

    # Prepare list of properties with grouped units
    property_list = list(property_map.values())

    # Prepare user data with only approved tenants, include unit_name
    user_data = user.__dict__.copy()
    user_data.pop("_sa_instance_state", None)
    user_data["tenants"] = []

    for t in approved_tenants:
        t_data = t.__dict__.copy()
        t_data.pop("_sa_instance_state", None)

        # 🔽 Add unit_name from associated property unit
        unit = (
            db.query(PropertyUnit).filter(PropertyUnit.id == t.property_unit_id).first()
        )
        if unit:
            t_data["unit_name"] = unit.name

        user_data["tenants"].append(t_data)

    return {
        "user": user_data,
        "properties": property_list,
    }
