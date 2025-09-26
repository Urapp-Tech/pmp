from sqlalchemy.orm import Session, joinedload
from app.models.property_units import PropertyUnit
from app.models.properties import Property
from app.models.tenants import Tenant
from uuid import UUID
from typing import List
from datetime import date
from app.modules.propertyUnits.schemas import (
    PropertyUnitLOV,
    BuildingUnitsLOV,
)


# def get_units_lov_by_manager(landlord_id: UUID, db: Session):

#     properties = db.query(Property.id).filter(Property.landlord_id == landlord_id).all()

#     property_ids = [prop.id for prop in properties]
#     if not property_ids:
#         return []

#     units = (
#         db.query(PropertyUnit).filter(PropertyUnit.property_id.in_(property_ids)).all()
#     )

#     return [PropertyUnitLOV.model_validate(unit) for unit in units]


def get_units_lov_by_manager(landlord_id: UUID, db: Session):

    # Fetch properties with their units
    properties = (
        db.query(Property)
        .options(
            joinedload(Property.units)
        )  # assumes Property.units = relationship("PropertyUnit", back_populates="property")
        .filter(Property.landlord_id == landlord_id)
        .all()
    )

    result = []

    for prop in properties:
        if not prop.units:
            continue

        items = [PropertyUnitLOV.model_validate(unit) for unit in prop.units]

        result.append(BuildingUnitsLOV(name=prop.name, items=items))

    return result


def get_available_units_lov_by_landlord(landlord_id: UUID, db: Session):
    """
    Return 'available' units for a landlord, excluding any unit that currently
    has an active, approved contract (Tenant.is_approved == True AND is_active == True AND contract_end >= today).
    This effectively enforces: is_approved is NOT true.
    """

    # 1) Precompute unit IDs that are taken by an approved, active contract
    approved_active_unit_ids = {
        row[0]
        for row in db.query(Tenant.property_unit_id)
        .filter(
            Tenant.is_active == True,
            Tenant.is_approved == True,
            Tenant.contract_end >= date.today(),
        )
        .all()
    }

    # 2) Fetch properties with their units (for this landlord)
    properties = (
        db.query(Property)
        .options(joinedload(Property.units))
        .filter(Property.landlord_id == landlord_id)
        .all()
    )

    # 3) Build LOV grouped by building, applying both filters:
    #    - unit.status == "available"
    #    - unit.id NOT IN approved_active_unit_ids  -> "is_approved is not true"
    result: List[BuildingUnitsLOV] = []
    for prop in properties:
        available_units = [
            unit
            for unit in prop.units
            if unit.status == "available" and unit.id not in approved_active_unit_ids
        ]
        if not available_units:
            continue

        items = [PropertyUnitLOV.model_validate(unit) for unit in available_units]
        result.append(BuildingUnitsLOV(name=prop.name, items=items))

    return result
