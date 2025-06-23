from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.properties import Property as PropertyModel
from app.models.property_units import PropertyUnit as PropertyUnitModel
from app.modules.properties.schemas import PropertyCreate, PropertyUpdate,PropertyOut
from uuid import uuid4
from fastapi import HTTPException, status, UploadFile
from typing import Optional
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import joinedload
from app.utils.uploader import save_uploaded_file, is_upload_file
from app.utils.logger import error_log, debug_log


def create_property(db: Session, body: PropertyCreate):
    try:
        # Check for duplicate
        existing = db.query(PropertyModel).filter(
            PropertyModel.name == body.name,
            PropertyModel.landlord_id == body.landlord_id
        ).first()
        if existing:
            error_log(
                Exception("Duplicate property name"),
                f"Property with name '{body.name}' already exists for landlord {body.landlord_id}"
            )                                      
            raise HTTPException(status_code=500, detail="Property with this name already exists for this landlord")

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
                        raise HTTPException(status_code=400, detail="Invalid picture format.")
        except Exception as e:
            error_log(e, "Failed to process property pictures")
            raise HTTPException(status_code=500, detail="Error while saving property pictures.")
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
        )
        db.add(property_data)

        # Process units
        units = []
        unit_nos = set()
        for unit_data in body.units or []:
            if unit_data.unit_no in unit_nos:
                raise HTTPException(status_code=400, detail=f"Duplicate unit number '{unit_data.unit_no}' in property units.")
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

        property_data = db.query(PropertyModel).options(joinedload(PropertyModel.units)).filter_by(id=property_id).first()
        property_dict = jsonable_encoder(property_data)
        return {
            "success": True,
            "message": "Property created successfully.",
            "items": property_dict,
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def update_property(property_id: str, db: Session, body: PropertyUpdate):
    try:
        property_data = db.query(PropertyModel).filter_by(id=property_id).first()
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found.")

        # Check duplicate name
        duplicate = db.query(PropertyModel).filter(
            PropertyModel.name == body.name,
            PropertyModel.landlord_id == body.landlord_id,
            PropertyModel.id != property_id
        ).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Another property with this name already exists for this landlord.")

        # Process property pictures
        picture_paths = []
        try:
            if body.pictures:
                for pic in body.pictures:
                    if is_upload_file(pic):
                        saved_name = save_uploaded_file(pic, "uploads/properties")
                        picture_paths.append(saved_name)
                    elif isinstance(pic, str):
                        picture_paths.append(pic)
                    else:
                        raise HTTPException(status_code=400, detail="Invalid picture format.")
        except Exception as e:
            error_log(e, "Failed to process property pictures.")
            raise HTTPException(status_code=500, detail="Error while saving property pictures.")

        # Update main property fields
        for attr in [
            "landlord_id", "name", "city", "governance", "address", "address2", "description",
            "property_type", "type", "paci_no", "property_no", "civil_no", "build_year",
            "book_value", "estimate_value", "latitude", "longitude", "status"
        ]:
            setattr(property_data, attr, getattr(body, attr))

        property_data.pictures = picture_paths

        # Existing unit ids from DB
        existing_units = {str(unit.id): unit for unit in db.query(PropertyUnitModel).filter_by(property_id=property_id).all()}
        input_unit_ids = set()

        for unit_data in body.units:
            unit_id = getattr(unit_data, 'id', None)
            unit_picture_paths = []

            if unit_data.pictures:
                for pic in unit_data.pictures:
                    if is_upload_file(pic):
                        saved = save_uploaded_file(pic, "uploads/units")
                        unit_picture_paths.append(saved)
                    elif isinstance(pic, str):
                        unit_picture_paths.append(pic)

            if unit_id and str(unit_id) in existing_units:
                # Update existing unit
                unit = existing_units[str(unit_id)]
                input_unit_ids.add(str(unit_id))
                unit.name = unit_data.name
                unit.unit_no = unit_data.unit_no
                unit.unit_type = unit_data.unit_type
                unit.size = unit_data.size
                unit.rent = unit_data.rent
                unit.description = unit_data.description
                unit.pictures = unit_picture_paths
                unit.bedrooms = unit_data.bedrooms
                unit.bathrooms = unit_data.bathrooms
                unit.water_meter = unit_data.water_meter
                unit.electricity_meter = unit_data.electricity_meter
                unit.status = unit_data.status
            else:
                # Add new unit
                new_unit = PropertyUnitModel(
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
                db.add(new_unit)

        # Delete removed units
        for unit_id in existing_units:
            if unit_id not in input_unit_ids:
                db.delete(existing_units[unit_id])

        db.commit()
        db.refresh(property_data)

        updated = db.query(PropertyModel).options(joinedload(PropertyModel.units)).filter_by(id=property_id).first()
        return {
            "success": True,
            "message": "Property updated successfully.",
            "items": jsonable_encoder(updated),
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def get_property(db: Session, property_id: str):
    property_data = (
        db.query(PropertyModel).options(joinedload(PropertyModel.units))
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


def get_property_units(db: Session, property_id: str, page: int = 1, size: int = 20, search: Optional[str] = None):
    units_query = db.query(PropertyUnitModel).filter(PropertyUnitModel.property_id == property_id)

    if search:
        search_term = f"%{search}%"
        units_query = units_query.filter(
            PropertyUnitModel.name.ilike(search_term) |
            PropertyUnitModel.description.ilike(search_term)
        )

    total = units_query.count()
    units = units_query.order_by(PropertyUnitModel.created_at.desc()).offset((page - 1) * size).limit(size).all()

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
        db: Session,landlord_id: Optional[str] = None, page: int = 1, size: int = 20, search: Optional[str] = None
):
    query = db.query(PropertyModel).options(joinedload(PropertyModel.units)).filter(PropertyModel.landlord_id == landlord_id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            PropertyModel.name.ilike(search_term) |
            PropertyModel.address.ilike(search_term)
        )

    total = query.count()
    #results =  query.order_by(PropertyModel.created_at.desc()).offset((page - 1) * size).limit(size).all()
    properties = query.order_by(PropertyModel.created_at.desc()).offset((page - 1) * size).limit(size).all()

    # Convert to list of PropertyOut
    results = [PropertyOut.model_validate(p) for p in properties]
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
            .filter(PropertyModel.id == property_id)
            .first()
        )

        if not property_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Property not found",
            )

        # Delete associated units first
        db.query(PropertyUnitModel).filter(
            PropertyUnitModel.property_id == property_id
        ).delete()

        # Delete the property
        db.delete(property_data)
        db.commit()
        return {"success": True, "message": "Property deleted successfully"}

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}",
        )