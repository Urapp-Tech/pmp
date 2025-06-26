from sqlalchemy.orm import Session, joinedload
from app.models.property_units import PropertyUnit
from app.models.properties import Property
from uuid import UUID
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

    properties = (
        db.query(Property)
        .options(joinedload(Property.units))
        .filter(Property.landlord_id == landlord_id)
        .all()
    )

    result = []

    for prop in properties:
        available_units = [unit for unit in prop.units if unit.status == "available"]

        if not available_units:
            continue

        items = [PropertyUnitLOV.model_validate(unit) for unit in available_units]
        result.append(
            BuildingUnitsLOV(
                name=prop.name,
                items=items,
            )
        )

    return result
