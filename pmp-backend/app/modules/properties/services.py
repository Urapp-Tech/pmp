from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.properties import Property as PropertyModel
from app.models.property_units import PropertyUnit as PropertyUnitModel
from app.modules.properties.schemas import PropertyCreate, PropertyUpdate
from uuid import uuid4
from fastapi import HTTPException, status, UploadFile
from typing import Optional
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
        for unit_data in body.units:
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
        return property_data

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def update_property(db: Session, property_id: str, body: PropertyUpdate):
    try:
        # Get the property
        property_data = (
            db.query(PropertyModel)
            .filter(PropertyModel.id == property_id)
            .first()
        )

        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")

        # Save new property images if any
        picture_paths = []
        if body.pictures:
            for pic in body.pictures:
                if isinstance(pic, UploadFile):
                    saved_name = save_uploaded_file(pic, "uploads/properties")
                    picture_paths.append(saved_name)
                else:
                    picture_paths.append(pic)  # existing filename

        # Update property fields
        property_data.name = body.name
        property_data.city = body.city
        property_data.governance = body.governance
        property_data.address = body.address
        property_data.address2 = body.address2
        property_data.description = body.description
        property_data.pictures = picture_paths
        property_data.property_type = body.property_type
        property_data.type = body.type
        property_data.paci_no = body.paci_no
        property_data.property_no = body.property_no
        property_data.civil_no = body.civil_no
        property_data.build_year = body.build_year
        property_data.book_value = body.book_value
        property_data.estimate_value = body.estimate_value
        property_data.latitude = body.latitude
        property_data.longitude = body.longitude
        property_data.status = body.status

        # Mark existing units inactive
        existing_units = db.query(PropertyUnitModel).filter(PropertyUnitModel.property_id == property_id).all()
        existing_units_map = {unit.unit_no: unit for unit in existing_units}
        for unit in existing_units:
            unit.status = "inactive"

        new_units = []
        for unit_data in body.units:
            unit_picture_paths = []
            if unit_data.pictures:
                for pic in unit_data.pictures:
                    if isinstance(pic, UploadFile):
                        saved_pic = save_uploaded_file(pic, "uploads/units")
                        unit_picture_paths.append(saved_pic)
                    else:
                        unit_picture_paths.append(pic)

            if unit_data.unit_no in existing_units_map:
                # Update existing unit
                existing_unit = existing_units_map[unit_data.unit_no]
                existing_unit.name = unit_data.name
                existing_unit.unit_type = unit_data.unit_type
                existing_unit.size = unit_data.size
                existing_unit.rent = unit_data.rent
                existing_unit.description = unit_data.description
                existing_unit.pictures = unit_picture_paths
                existing_unit.bedrooms = unit_data.bedrooms
                existing_unit.bathrooms = unit_data.bathrooms
                existing_unit.water_meter = unit_data.water_meter
                existing_unit.electricity_meter = unit_data.electricity_meter
                existing_unit.status = unit_data.status or "active"
            else:
                # Create new unit
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
                    status=unit_data.status or "active",
                )
                new_units.append(new_unit)

        db.add_all(new_units)
        db.commit()
        db.refresh(property_data)
        return property_data

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")



def get_property(db: Session, property_id: str):
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
    
    return property_data


def get_properties(db: Session, landlord_id: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(PropertyModel)
    
    if landlord_id:
        query = query.filter(PropertyModel.landlord_id == landlord_id)
    
    return query.offset(skip).limit(limit).all()


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
        
        return {"message": "Property deleted successfully"}

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}",
        )