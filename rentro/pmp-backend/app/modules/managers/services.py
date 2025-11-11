from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from app.models.managers import Manager
from app.models.property_units import PropertyUnit
from app.models.properties import Property
from app.modules.managers.schemas import (
    ManagerAssignCreate,
    ManagerPropertyOut,
    PropertyOut,
)

def assign_properties_to_manager(data: ManagerAssignCreate, db: Session):
    try:
        # Step 1: Get current active assignments
        current_assignments = (
            db.query(Manager)
            .filter(
                Manager.manager_user_id == data.manager_user_id,
                Manager.is_active == True,
            )
            .all()
        )
        current_property_ids = {m.assign_property for m in current_assignments}
        requested_property_ids = set(data.assign_properties)

        # Step 2: Deactivate unrequested ones
        for assignment in current_assignments:
            if assignment.assign_property not in requested_property_ids:
                assignment.is_active = False
                db.add(assignment)

        # Step 3: Add new assignments
        for property_id in requested_property_ids - current_property_ids:
            # Deactivate existing assignments of this unit
            existing = (
                db.query(Manager)
                .filter(
                    Manager.assign_property == property_id, Manager.is_active == True
                )
                .first()
            )
            if existing:
                existing.is_active = False
                db.add(existing)

            new_assignment = Manager(
                manager_user_id=data.manager_user_id,
                assign_property=property_id,
                is_active=True,
            )
            db.add(new_assignment)

        db.flush()

        # Step 4: Get current active assignments for response
        active_assignments = (
            db.query(Manager)
            .options(joinedload(Manager.assigned_property))
            .filter(
                Manager.manager_user_id == data.manager_user_id,
                Manager.is_active.is_(True),
            )
            .all()
        )
        items = [
            ManagerPropertyOut(
                id=m.id,
                manager_user_id=m.manager_user_id,
                assign_property=PropertyOut.from_orm(m.assigned_property),
                is_active=m.is_active,
                created_at=m.created_at,
            )
            for m in active_assignments
        ]
        db.commit()

        return {
            "success": True,
            "message": "Property assigned successfully.",
            "items": items,
            # "available_units": available_units_out,
        }

    except SQLAlchemyError as e:
        db.rollback()
        print(f"[ERROR] assign_units_to_manager: {str(e)}")
        return {
            "success": False,
            "message": "Assignment failed due to a database error.",
            "items": [],
            "available_units": [],
        }
