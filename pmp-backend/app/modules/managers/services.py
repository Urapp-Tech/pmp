from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from app.models.managers import Manager
from app.models.property_units import PropertyUnit
from app.modules.managers.schemas import (
    ManagerAssignCreate,
    ManagerUnitOut,
    PropertyUnitOut,
)
from sqlalchemy.exc import SQLAlchemyError

# from fastapi import HTTPException
# from app.modules.managers.schemas import AssignUserOut


# def assign_managers(data: ManagerAssignCreate, db: Session):
#     created = []
#     for assign_user_id in data.assign_users:

#         existing = (
#             db.query(Manager)
#             .filter(Manager.assign_user == assign_user_id, Manager.is_active == True)
#             .first()
#         )

#         if existing:
#             if existing.manager_user_id == data.manager_user_id:
#                 continue
#             else:
#                 existing.is_active = False
#                 db.add(existing)

#         new_entry = Manager(
#             manager_user_id=data.manager_user_id,
#             assign_user=assign_user_id,
#             is_active=True,
#         )
#         db.add(new_entry)
#         created.append(new_entry)

#     db.commit()

#     created_ids = [entry.id for entry in created]

#     # Now load with the assign_user (joined)
#     assigned_managers = (
#         db.query(Manager)
#         .options(joinedload(Manager.assigned_user))
#         .filter(Manager.id.in_(created_ids))
#         .all()
#     )

#     # Map assign_user to assigned_user so Pydantic schema matches
#     for m in assigned_managers:
#         m.assign_user = m.assigned_user  # <- this is crucial

#     return {
#         "success": True,
#         "message": "Assigned successfully.",
#         "items": assigned_managers,
#     }


# def assign_managers(data: ManagerAssignCreate, db: Session):
#     created = []


#     try:
#         for assign_user_id in data.assign_users:
#             # Check if already assigned
#             existing = (
#                 db.query(Manager)
#                 .filter(
#                     Manager.assign_user == assign_user_id, Manager.is_active == True
#                 )
#                 .first()
#             )

#             if existing:
#                 if existing.manager_user_id == data.manager_user_id:
#                     continue  # already assigned to this manager
#                 else:
#                     existing.is_active = False
#                     db.add(existing)

#             # Create new assignment
#             new_entry = Manager(
#                 manager_user_id=data.manager_user_id,
#                 assign_user=assign_user_id,
#                 is_active=True,
#             )
#             db.add(new_entry)
#             created.append(new_entry)

#         db.flush()  # get primary keys generated

#         # Get full Manager rows with user relationship loaded
#         created_ids = [entry.id for entry in created]
#         assigned_managers = (
#             db.query(Manager)
#             .options(joinedload(Manager.assigned_user))
#             .filter(Manager.id.in_(created_ids))
#             .all()
#         )

#         # Build response using schema manually
#         result_items = []
#         for m in assigned_managers:
#             if not m.assigned_user:
#                 raise ValueError("Assigned user not loaded or missing fields")

#             assign_user = AssignUserOut.from_orm(m.assigned_user)
#             result_items.append(
#                 ManagerOut(
#                     id=m.id,
#                     manager_user_id=m.manager_user_id,
#                     assign_user=assign_user,
#                     is_active=m.is_active,
#                     created_at=m.created_at,
#                 )
#             )

#         db.commit()

#         return {
#             "success": True,
#             "message": "Assigned successfully.",
#             "items": result_items,
#         }

#     except (SQLAlchemyError, ValueError) as e:
#         db.rollback()
#         print(f"[ERROR] assign_managers failed: {str(e)}")
#         return {
#             "success": False,
#             "message": "Assignment failed due to an internal error.",
#             "items": [],
#         }


# for users
# def assign_managers(data: ManagerAssignCreate, db: Session):
#     try:
#         # Step 1: Get current active assignments of this manager
#         current_assignments = (
#             db.query(Manager)
#             .filter(
#                 Manager.manager_user_id == data.manager_user_id,
#                 Manager.is_active == True,
#             )
#             .all()
#         )

#         current_user_ids = {m.assign_user for m in current_assignments}
#         requested_user_ids = set(data.assign_users)

#         # Step 2: Deactivate users that are not in new request
#         for assignment in current_assignments:
#             if assignment.assign_user not in requested_user_ids:
#                 assignment.is_active = False
#                 db.add(assignment)

#         # Step 3: Add new assignments
#         for assign_user_id in requested_user_ids - current_user_ids:
#             # Check if user is assigned to another manager
#             existing = (
#                 db.query(Manager)
#                 .filter(
#                     Manager.assign_user == assign_user_id,
#                     Manager.is_active == True,
#                 )
#                 .first()
#             )
#             if existing:
#                 existing.is_active = False
#                 db.add(existing)

#             new_assignment = Manager(
#                 manager_user_id=data.manager_user_id,
#                 assign_user=assign_user_id,
#                 is_active=True,
#             )
#             db.add(new_assignment)

#         db.flush()  # allow SQLAlchemy to assign IDs

#         # Step 4: Return all current active assignments for this manager
#         active_assignments = (
#             db.query(Manager)
#             .options(joinedload(Manager.assigned_user))
#             .filter(
#                 Manager.manager_user_id == data.manager_user_id,
#                 Manager.is_active == True,
#             )
#             .all()
#         )

#         result_items = []
#         for m in active_assignments:
#             assign_user = AssignUserOut.model_validate(m.assigned_user)
#             result_items.append(
#                 ManagerOut(
#                     id=m.id,
#                     manager_user_id=m.manager_user_id,
#                     assign_user=assign_user,
#                     is_active=m.is_active,
#                     created_at=m.created_at,
#                 )
#             )

#         db.commit()

#         return {
#             "success": True,
#             "message": "Assigned successfully.",
#             "items": result_items,
#         }

#     except SQLAlchemyError as e:
#         db.rollback()
#         print(f"[ERROR] assign_managers: {str(e)}")
#         return {
#             "success": False,
#             "message": "Assignment failed due to a database error.",
#             "items": [],
#         }


# for units
def assign_units_to_manager(data: ManagerAssignCreate, db: Session):
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

        current_unit_ids = {m.assign_property_unit for m in current_assignments}
        requested_unit_ids = set(data.assign_units)

        # Step 2: Deactivate unrequested ones
        for assignment in current_assignments:
            if assignment.assign_property_unit not in requested_unit_ids:
                assignment.is_active = False
                db.add(assignment)

        # Step 3: Add new assignments
        for unit_id in requested_unit_ids - current_unit_ids:
            # Deactivate existing assignments of this unit
            existing = (
                db.query(Manager)
                .filter(
                    Manager.assign_property_unit == unit_id, Manager.is_active == True
                )
                .first()
            )
            if existing:
                existing.is_active = False
                db.add(existing)

            new_assignment = Manager(
                manager_user_id=data.manager_user_id,
                assign_property_unit=unit_id,
                is_active=True,
            )
            db.add(new_assignment)

        db.flush()

        # Step 4: Get current active assignments for response
        active_assignments = (
            db.query(Manager)
            .options(joinedload(Manager.assigned_unit))
            .filter(
                Manager.manager_user_id == data.manager_user_id,
                Manager.is_active == True,
            )
            .all()
        )

        items = [
            ManagerUnitOut(
                id=m.id,
                manager_user_id=m.manager_user_id,
                assign_property_unit=PropertyUnitOut.from_orm(m.assigned_unit),
                is_active=m.is_active,
                created_at=m.created_at,
            )
            for m in active_assignments
        ]

        # Step 5: Get available units (not assigned currently)
        # assigned_unit_ids = (
        #     db.query(Manager.assign_property_unit)
        #     .filter(Manager.is_active == True)
        #     .distinct()
        # )

        # available_units = (
        #     db.query(PropertyUnit)
        #     .filter(
        #         PropertyUnit.status == "available",  # assuming status is a column
        #         ~PropertyUnit.id.in_(assigned_unit_ids),
        #     )
        #     .all()
        # )

        # available_units_out = [
        #     PropertyUnitOut.model_validate(u) for u in available_units
        # ]

        db.commit()

        return {
            "success": True,
            "message": "Units assigned successfully.",
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
