from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.properties import Property as PropertyModel
from app.models.managers import Manager
from app.models.users import User
from app.models.property_units import PropertyUnit as PropertyUnitModel
from app.modules.properties.schemas import PropertyCreate, PropertyUpdate, PropertyOut
from uuid import uuid4
from fastapi import HTTPException, status, UploadFile
from typing import Optional
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import joinedload, selectinload
from app.utils.uploader import save_uploaded_file, is_upload_file
from app.utils.logger import error_log, debug_log
from uuid import UUID


def create_property(db: Session, body: PropertyCreate):
    try:
        # Check for duplicate
        existing = (
            db.query(PropertyModel)
            .filter(
                PropertyModel.name == body.name,
                PropertyModel.landlord_id == body.landlord_id,
            )
            .first()
        )
        if existing:
            error_log(
                Exception("Duplicate property name"),
                f"Property with name '{body.name}' already exists for landlord {body.landlord_id}",
            )
            raise HTTPException(
                status_code=500,
                detail="Property with this name already exists for this landlord",
            )

        property_id = uuid4()

        # Save property pictures
        picture_paths = []

        try:
            if body.pictures:

                debug_log(body)
                for pic in body.pictures:
                    if is_upload_file(pic):
                        debug_log(f"Processing picture: {pic}")
                        saved_name = save_uploaded_file(pic, "uploads/properties")
                        picture_paths.append(saved_name)
                    elif isinstance(pic, str):
                        picture_paths.append(pic)
                    else:
                        raise HTTPException(
                            status_code=400, detail="Invalid picture format."
                        )
        except Exception as e:
            error_log(e, "Failed to process property pictures")
            raise HTTPException(
                status_code=500, detail="Error while saving property pictures."
            )
        # Create Property
        property_data = PropertyModel(
            id=property_id,
            landlord_id=body.landlord_id,
            name=body.name,
            city=body.city,
            governance=body.governance,
            address=body.address,
            address2=body.address2,
            description=body.description,
            pictures=picture_paths,
            property_type=body.property_type,
            type=body.type,
            paci_no=body.paci_no,
            property_no=body.property_no,
            civil_no=body.civil_no,
            build_year=body.build_year,
            book_value=body.book_value,
            estimate_value=body.estimate_value,
            latitude=body.latitude,
            longitude=body.longitude,
            status=body.status,
            unit_counts=body.unit_counts,         
            bank_name=body.bank_name,           
            account_no=body.account_no,          
            account_name=body.account_name,  
        )
        db.add(property_data)

        # Process units
        units = []
        unit_nos = set()
        for unit_data in body.units or []:
            if unit_data.unit_no in unit_nos:
                raise HTTPException(
                    status_code=400,
                    detail=f"Duplicate unit number '{unit_data.unit_no}' in property units.",
                )
            unit_picture_paths = []
            if unit_data.pictures:
                for unit_pic in unit_data.pictures:
                    if is_upload_file(unit_pic):
                        saved_unit_pic = save_uploaded_file(unit_pic, "uploads/units")
                        unit_picture_paths.append(saved_unit_pic)
                    elif isinstance(unit_pic, str):
                        unit_picture_paths.append(unit_pic)

            unit = PropertyUnitModel(
                id=uuid4(),
                property_id=property_id,
                name=unit_data.name,
                unit_no=unit_data.unit_no,
                unit_type=unit_data.unit_type,
                size=unit_data.size,
                rent=unit_data.rent,
                description=unit_data.description,
                pictures=unit_picture_paths,
                bedrooms=unit_data.bedrooms,
                bathrooms=unit_data.bathrooms,
                water_meter=unit_data.water_meter,
                electricity_meter=unit_data.electricity_meter,
                status=unit_data.status,
            )
            units.append(unit)

        db.add_all(units)
        db.commit()
        db.refresh(property_data)

        property_data = (
            db.query(PropertyModel)
            .options(joinedload(PropertyModel.units))
            .filter_by(id=property_id)
            .first()
        )
        property_dict = jsonable_encoder(property_data)
        return {
            "success": True,
            "message": "Property created successfully.",
            "items": property_dict,
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def update_property(db: Session, property_id: UUID, body):
    try:
        property_data = db.query(PropertyModel).filter_by(id=property_id).first()
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")

        # ✅ Save/Keep property-level pictures
        picture_paths = []

        # return body
        try:
            if body["pictures"]:
                for pic in body["pictures"]:
                    if is_upload_file(pic):
                        saved_name = save_uploaded_file(pic, "uploads/properties")
                        picture_paths.append(saved_name)
                    elif isinstance(pic, str):
                        picture_paths.append(pic)
        except Exception as e:
            error_log(e, "Failed to process property pictures")
            raise HTTPException(
                status_code=500, detail="Error while saving property pictures."
            )

        # ✅ Update basic fields
        property_data.name = body["name"]
        property_data.city = body["city"]
        property_data.governance = body["governance"]
        property_data.address = body["address"]
        property_data.address2 = body["address2"]
        property_data.description = body["description"]
        property_data.pictures = picture_paths
        property_data.property_type = body["property_type"]
        property_data.type = body["type"]
        property_data.paci_no = body["paci_no"]
        property_data.property_no = body["property_no"]
        property_data.civil_no = body["civil_no"]
        property_data.build_year = body["build_year"]
        property_data.book_value = body["book_value"]
        property_data.estimate_value = body["estimate_value"]
        property_data.latitude = body["latitude"]
        property_data.longitude = body["longitude"]
        property_data.status = body["status"]
        property_data.unit_counts = body["unit_counts"]
        property_data.bank_name = body["bank_name"]
        property_data.account_no = body["account_no"]
        property_data.account_name = body["account_name"]


        # ✅ Track existing units for update vs delete
        existing_units = {str(u.id): u for u in property_data.units}
        new_unit_ids = set()

        # ✅ Handle flat list of unit pictures
        flat_unit_pictures = body.get("unit_pictures", [])
        pic_offset = 0

        for unit_data in body["units"] or []:
            unit_id = str(unit_data.get("id", None))
            unit_picture_paths = []

            # Extract `pictures_count` and slice the flat list
            count = int(unit_data.get("pictures_count", 0))
            files_for_unit = flat_unit_pictures[pic_offset : pic_offset + count]
            pic_offset += count

            # Process both new + existing pictures
            for pic in unit_data.get("pictures", []) + files_for_unit:
                if is_upload_file(pic):
                    saved_pic = save_uploaded_file(pic, "uploads/units")
                    unit_picture_paths.append(saved_pic)
                elif isinstance(pic, str):
                    unit_picture_paths.append(pic)

            # Update or Create unit
            if unit_id and unit_id in existing_units:
                unit = existing_units[unit_id]
                unit.name = unit_data["name"]
                unit.unit_no = unit_data["unit_no"]
                unit.unit_type = unit_data["unit_type"]
                unit.size = unit_data["size"]
                unit.rent = unit_data["rent"]
                unit.description = unit_data["description"]
                unit.pictures = unit_picture_paths
                unit.bedrooms = unit_data["bedrooms"]
                unit.bathrooms = unit_data["bathrooms"]
                unit.water_meter = unit_data["water_meter"]
                unit.electricity_meter = unit_data["electricity_meter"]
                unit.status = unit_data["status"]
                new_unit_ids.add(unit_id)
            else:
                new_unit = PropertyUnitModel(
                    id=uuid4(),
                    property_id=property_id,
                    name=unit_data["name"],
                    unit_no=unit_data["unit_no"],
                    unit_type=unit_data["unit_type"],
                    size=unit_data["size"],
                    rent=unit_data["rent"],
                    description=unit_data["description"],
                    pictures=unit_picture_paths,
                    bedrooms=unit_data["bedrooms"],
                    bathrooms=unit_data["bathrooms"],
                    water_meter=unit_data["water_meter"],
                    electricity_meter=unit_data["electricity_meter"],
                    status=unit_data["status"],
                )
                db.add(new_unit)

        # ✅ Remove deleted units
        for existing_unit_id, unit in existing_units.items():
            if existing_unit_id not in new_unit_ids:
                db.delete(unit)

        db.commit()
        db.refresh(property_data)

        property_data = (
            db.query(PropertyModel)
            .options(joinedload(PropertyModel.units))
            .filter_by(id=property_id)
            .first()
        )
        return {
            "success": True,
            "message": "Property updated successfully.",
            "items": jsonable_encoder(property_data),
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def get_property(db: Session, property_id: str):
    property_data = (
        db.query(PropertyModel)
        .options(joinedload(PropertyModel.units))
        .filter(PropertyModel.id == property_id)
        .first()
    )

    if not property_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    return {
        "success": True,
        "message": "Property retrieved successfully.",
        "property": jsonable_encoder(property_data),
    }


def get_property_units(
    db: Session,
    property_id: str,
    page: int = 1,
    size: int = 20,
    search: Optional[str] = None,
):
    units_query = db.query(PropertyUnitModel).filter(
        PropertyUnitModel.property_id == property_id
    )

    if search:
        search_term = f"%{search}%"
        units_query = units_query.filter(
            PropertyUnitModel.name.ilike(search_term)
            | PropertyUnitModel.description.ilike(search_term)
        )

    total = units_query.count()
    units = (
        units_query.order_by(PropertyUnitModel.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    if not units:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": jsonable_encoder(units),
    }


def get_properties(
    db: Session,
    user_id: Optional[str] = None,
    role_id: Optional[str] = None,
    page: int = 1,
    size: int = 20,
    search: Optional[str] = None,
):
    # Super Admin: fetch all
    if role_id == "Super Admin":
        query = (
            db.query(PropertyModel)
            .options(selectinload(PropertyModel.units))
            .filter(PropertyModel.is_active == True)
        )

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                PropertyModel.name.ilike(search_term)
                | PropertyModel.address.ilike(search_term)
            )

        total = query.count()
        properties = (
            query.order_by(PropertyModel.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
            .all()
        )

        results = [PropertyOut.model_validate(prop) for prop in properties]

        return {
            "success": True,
            "total": total,
            "page": page,
            "size": size,
            "items": results,
        }
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.landlord_id:
        return {
            "success": True,
            "total": 0,
            "page": page,
            "size": size,
            "items": [],
        }

    landlord_id = user.landlord_id
    query = (
        db.query(PropertyModel)
        .options(selectinload(PropertyModel.units))
        .filter(PropertyModel.is_active == True)
    )

    if role_id == "Landlord":
        query = query.filter(PropertyModel.landlord_id == landlord_id)

    elif role_id == "Manager":
        managers = (
            db.query(Manager)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .all()
        )

        assigned_unit_ids = []
        for m in managers:
            if m.assign_property_unit:
                assigned_unit_ids.append(m.assign_property_unit)

        assigned_unit_ids = list(set(assigned_unit_ids))

        if not assigned_unit_ids:
            return {
                "success": True,
                "total": 0,
                "page": page,
                "size": size,
                "items": [],
            }

        units = (
            db.query(PropertyUnitModel)
            .filter(
                PropertyUnitModel.id.in_(assigned_unit_ids),
                PropertyUnitModel.is_active == True,
            )
            .all()
        )

        allowed_property_ids = list(set(unit.property_id for unit in units))
        query = query.filter(PropertyModel.id.in_(allowed_property_ids))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            PropertyModel.name.ilike(search_term)
            | PropertyModel.address.ilike(search_term)
        )

    total = query.count()
    properties = (
        query.order_by(PropertyModel.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    results = []
    for prop in properties:
        if role_id == "Manager":
            prop.units = [
                unit
                for unit in prop.units
                if unit.id in assigned_unit_ids and unit.is_active
            ]
        else:
            prop.units = [unit for unit in prop.units if unit.is_active]

        results.append(PropertyOut.model_validate(prop))

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": results,
    }


def delete_property(db: Session, property_id: str):
    try:
        property_data = (
            db.query(PropertyModel)
            .filter(PropertyModel.id == property_id, PropertyModel.is_active == True)
            .first()
        )

        if not property_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found or already inactive.",
            )

        # Soft delete associated property units
        db.query(PropertyUnitModel).filter(
            PropertyUnitModel.property_id == property_id
        ).update({PropertyUnitModel.is_active: False})

        # Soft delete the property
        property_data.is_active = False

        db.commit()
        return {
            "success": True,
            "message": "Property and their units has been deleted successfully",
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Soft delete failed: {str(e)}",
        )
