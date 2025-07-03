import json
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
    Query,
)
from uuid import UUID
from h11 import Request
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.modules.properties.schemas import (
    PropertyOut,
    PropertyCreate,
    PropertyUpdate,
    PaginatedPropertyOut,
    PaginatedPropertyUnitOut,
)
from app.modules.properties.services import (
    create_property,
    update_property,
    get_property,
    get_property_units,
    get_properties,
    delete_property,
    get_properties_super_admin_view,
    toggle_property_status,
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
    units_data: Optional[List[str]] = Form(None),  # JSON strings for each unit
    unit_pictures: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
):
    # Parse each unit JSON into dicts
    parsed_units = []
    unit_pic_index = 0

    for unit_json in units_data or []:
        unit = json.loads(unit_json)
        unit_pics_count = int(unit.get("pictures_count", 0))  # pass this from frontend
        unit["pictures"] = unit_pictures[
            unit_pic_index : unit_pic_index + unit_pics_count
        ]
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
        "units": parsed_units,
    }

    # Validate with PropertyCreate schema
    body = PropertyCreate(**property_obj)
    return create_property(db=db, body=body)


@router.post("/update/{property_id}")
async def update_property_endpoint(
    property_id: UUID,
    landlord_id: Optional[UUID] = Form(None),
    name: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    governance: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    address2: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    property_type: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    paci_no: Optional[str] = Form(None),
    property_no: Optional[str] = Form(None),
    civil_no: Optional[str] = Form(None),
    build_year: Optional[str] = Form(None),
    book_value: Optional[str] = Form(None),
    estimate_value: Optional[str] = Form(None),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    is_active: Optional[str] = Form(None),
    pictures: List[UploadFile] = File(default=[]),
    existing_pictures: Optional[str] = Form("[]"),
    units_data: Optional[List[str]] = Form(None),
    unit_pictures: List[UploadFile] = File(default=[]),
    existing_unit_pictures: Optional[str] = Form("{}"),
    removed_unit_ids: Optional[str] = Form("[]"),
    db: Session = Depends(get_db),
):  # ✅ Parse existing property picture strings
    try:
        existing_property_pictures = json.loads(existing_pictures or "[]")
        if not isinstance(existing_property_pictures, list):
            raise HTTPException(
                status_code=400, detail="Invalid format for existing_pictures"
            )
    except Exception:
        raise HTTPException(
            status_code=400, detail="Invalid format for existing_pictures"
        )

    # ✅ Just merge existing + new property pictures (no saving here)
    all_property_pictures = (
        existing_property_pictures + pictures
    )  # mix of str and UploadFile

    is_active_bool = str(is_active).lower() == "true" if is_active is not None else None

    # ✅ Parse and combine unit pictures (no saving)
    try:
        existing_unit_pic_map = json.loads(existing_unit_pictures or "{}")
    except Exception:
        raise HTTPException(
            status_code=400, detail="Invalid format for existing_unit_pictures"
        )

    parsed_units = []
    unit_pic_index = 0

    for idx, unit_json in enumerate(units_data or []):
        try:
            unit = json.loads(unit_json)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid unit format")

        count = int(unit.get("pictures_count", 0))
        new_files = unit_pictures[unit_pic_index : unit_pic_index + count]
        unit_pic_index += count

        existing_paths = existing_unit_pic_map.get(str(idx), [])
        combined_pics = existing_paths + new_files  # still mixed: str + UploadFile

        unit["pictures"] = combined_pics
        parsed_units.append(unit)

    # ✅ Build body dict to forward to update logic
    body = {
        "landlord_id": landlord_id,
        "name": name,
        "city": city,
        "governance": governance,
        "address": address,
        "address2": address2,
        "description": description,
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
        "pictures": all_property_pictures,
        "removed_unit_ids": json.loads(removed_unit_ids or "[]"),
        "units": parsed_units,
    }

    if is_active_bool is not None:
        body["is_active"] = is_active_bool

    # Call the main update function
    # return update_property(property_id=str(property_id), db=db, body=body)

    # return body
    # ✅ Validate
    # body = PropertyUpdate(**property_obj)

    # ✅ Update
    return update_property(property_id=property_id, db=db, body=body)


@router.get("/{property_id}")
def get_property_by_id(property_id: UUID4, db: Session = Depends(get_db)):
    """Get a property by ID with its units"""
    return get_property(db, str(property_id))  # <-- this should be the service function


@router.get("/")
def get_all_properties(
    db: Session = Depends(get_db),
    user_id: Optional[UUID4] = None,
    role_id: Optional[str] = None,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=1000, description="Page size"),
    search: Optional[str] = None,
):
    return get_properties(db, user_id, role_id, page, size, search)


@router.get("/super-admin/view")
def get_all_properties_super_admin_view(
    db: Session = Depends(get_db),
    user_id: Optional[UUID4] = None,
    role_id: Optional[str] = None,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=1000, description="Page size"),
    search: Optional[str] = None,
):
    return get_properties_super_admin_view(db, user_id, role_id, page, size, search)


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
def delete_property_by_id(id: UUID, db: Session = Depends(get_db)):
    """Delete a property and all its units"""
    return delete_property(db, str(id))


@router.post("/toggle-status/{property_id}")
def toggle_status(property_id: UUID, is_active: bool, db: Session = Depends(get_db)):
    return toggle_property_status(db=db, property_id=property_id, is_active=is_active)
