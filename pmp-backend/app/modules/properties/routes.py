import json
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, Query
from uuid import UUID
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.modules.properties.schemas import (
    PropertyOut,
    PropertyCreate,
    PropertyUpdate,
    PaginatedPropertyOut,
    PaginatedPropertyUnitOut
)
from app.modules.properties.services import (
    create_property,
    update_property,
    get_property,
    get_property_units,
    get_properties,
    delete_property
)
from typing import Optional, List

router = APIRouter()

# @router.post("/create", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
# def create_property_with_units(
#     property: PropertyCreate, 
#     db: Session = Depends(get_db)
# ):
#     """Create a new property with its units"""
#     return create_property(db, property)

@router.post("/create")
async def create_property_endpoint(
    landlord_id: UUID = Form(...),
    name: str = Form(...),
    city: str = Form(...),
    governance: str = Form(...),
    address: str = Form(...),
    address2: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    property_type: str = Form(...),
    type: str = Form(...),
    paci_no: str = Form(...),
    property_no: str = Form(...),
    civil_no: str = Form(...),
    build_year: str = Form(...),
    book_value: str = Form(...),
    estimate_value: str = Form(...),
    latitude: str = Form(...),
    longitude: str = Form(...),
    status: str = Form(...),
    pictures: List[UploadFile] = File([]),
    units_data:  Optional[List[str]] = Form(None),  # JSON strings for each unit
    unit_pictures: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
):
    # Parse each unit JSON into dicts
    parsed_units = []
    unit_pic_index = 0

    for unit_json in units_data or []:
        unit = json.loads(unit_json)
        unit_pics_count = int(unit.get('pictures_count', 0))  # pass this from frontend
        unit['pictures'] = unit_pictures[unit_pic_index:unit_pic_index + unit_pics_count]
        parsed_units.append(unit)
        unit_pic_index += unit_pics_count

    # Construct full object for validation
    property_obj = {
        "landlord_id": landlord_id,
        "name": name,
        "city": city,
        "governance": governance,
        "address": address,
        "address2": address2,
        "description": description,
        "pictures": pictures,
        "property_type": property_type,
        "type": type,
        "paci_no": paci_no,
        "property_no": property_no,
        "civil_no": civil_no,
        "build_year": build_year,
        "book_value": book_value,
        "estimate_value": estimate_value,
        "latitude": latitude,
        "longitude": longitude,
        "status": status,
        "units": parsed_units
    }

    # Validate with PropertyCreate schema
    body = PropertyCreate(**property_obj)
    return create_property(db=db, body=body)

@router.put("/update/{property_id}")
def update_property_with_units(
    property_id: UUID, 
    property: PropertyUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a property and its units:
    - Updates existing property fields
    - Handles unit addition, updates, and deletion
    """
    return update_property(property_id=str(property_id), db=db, body=property)


@router.get("/{property_id}")
def get_property_by_id(
    property_id: UUID4, 
    db: Session = Depends(get_db)
):
    """Get a property by ID with its units"""
    return get_property(db, str(property_id))  # <-- this should be the service function

@router.get("/")
def get_all_properties(
    db: Session = Depends(get_db),
    landlord_id: Optional[UUID4] = None,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=1000, description="Page size"),
    search: Optional[str] = None,
):
    return get_properties(db, landlord_id, page, size, search)

@router.get("/units/{property_id}")
def get_all_property_units(
    property_id: UUID4,  # required
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=1000, description="Page size"),
    search: Optional[str] = None,
):
    return get_property_units(db, property_id, page, size, search)

@router.post("/delete/{id}")
def delete_property_by_id(
    id: UUID, 
    db: Session = Depends(get_db)
):
    """Delete a property and all its units"""
    return delete_property(db, str(id))