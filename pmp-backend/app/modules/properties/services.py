import json
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from app.models.properties import Property as PropertyModel
from app.models.managers import Manager
from app.models.users import User
from app.models.tenants import Tenant
from app.models.property_units import PropertyUnit as PropertyUnitModel
from app.modules.properties.schemas import (
    PropertyCreate,
    PropertyUpdate,
    PropertyOut,
    PropertyUnitOut,
)
from uuid import uuid4
from fastapi import HTTPException, status, UploadFile
from typing import Optional, List
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import joinedload, selectinload
from app.utils.uploader import save_uploaded_file, is_upload_file
from app.utils.logger import error_log, debug_log
from uuid import UUID
import requests
from app.core.config import settings
from urllib.parse import urlencode

MYFATOORAH_API_URL = settings.MYFATOORAH_API_URL
MYFATOORAH_API_KEY = settings.MYFATOORAH_API_KEY


def create_supplier_in_fatoorah(property_obj):
    print("✅ Creating supplier in MyFatoorah for property:", MYFATOORAH_API_KEY)
    payload = {
        "SupplierName": property_obj.name,
        "Mobile": property_obj.phone,
        "Email": property_obj.email,
        "IsPercentageOfNetValue": True,
        "CommissionValue": 0,
        "CommissionPercentage": 0,
        "DepositTerms": "Daily",  # ✅ OK
        # "DepositDay" should be removed if not needed
        # "BankId": 1,                # ✅ Replace if real BankId is different
        "BankAccountHolderName": property_obj.account_name,
        "BankAccount": property_obj.account_no.replace(" ", "").replace("-", ""),
        # Remove "Iban" field if you don’t have it
        "IsActive": True,
        # Remove LogoFile if None
        "BusinessName": property_obj.name,
        "BusinessType": 1,
        "DisplaySupplierDetails": True,
    }

    headers = {
        "Authorization": f"Bearer {MYFATOORAH_API_KEY}",
        "Content-Type": "application/json",
    }

    print("📤 Creating supplier in MyFatoorah with payload:", payload)

    # ✅ Correct endpoint for creating supplier
    response = requests.post(
        f"{MYFATOORAH_API_URL}/CreateSupplier", json=payload, headers=headers
    )

    print("🔗 MyFatoorah Supplier API response:", response.status_code, response.text)

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"MyFatoorah Supplier creation failed: {response.status_code} - {response.text}",
        )

    try:
        supplier_data = response.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"MyFatoorah returned non-JSON response: {response.text}",
        )

    supplier_code = supplier_data.get("Data", {}).get("SupplierCode")
    if not supplier_code:
        raise HTTPException(
            status_code=500,
            detail="Failed to get SupplierCode from MyFatoorah response",
        )

    print("✅ Supplier created with code:", supplier_code)
    return supplier_code


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
            email=body.email,
            phone=body.phone,
            iban_no=body.iban_no,
            bank_name=body.bank_name,
            account_no=body.account_no,
            account_name=body.account_name,
        )

        # supplier_code = create_supplier_in_fatoorah(property_data)
        # property_data.supplier_code = supplier_code

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


# def update_property(db: Session, property_id: UUID, body):
#     try:
#         property_data = db.query(PropertyModel).filter_by(id=property_id).first()
#         if not property_data:
#             raise HTTPException(status_code=404, detail="Property not found")

#         # ✅ Save/Keep property-level pictures
#         picture_paths = []

#         # return body
#         try:
#             if body["pictures"]:
#                 for pic in body["pictures"]:
#                     if is_upload_file(pic):
#                         saved_name = save_uploaded_file(pic, "uploads/properties")
#                         picture_paths.append(saved_name)
#                     elif isinstance(pic, str):
#                         picture_paths.append(pic)
#         except Exception as e:
#             error_log(e, "Failed to process property pictures")
#             raise HTTPException(
#                 status_code=500, detail="Error while saving property pictures."
#             )

#         # ✅ Update basic fields
#         property_data.name = body["name"]
#         property_data.city = body["city"]
#         property_data.governance = body["governance"]
#         property_data.address = body["address"]
#         property_data.address2 = body["address2"]
#         property_data.description = body["description"]
#         property_data.pictures = picture_paths
#         property_data.property_type = body["property_type"]
#         property_data.type = body["type"]
#         property_data.paci_no = body["paci_no"]
#         property_data.property_no = body["property_no"]
#         property_data.civil_no = body["civil_no"]
#         property_data.build_year = body["build_year"]
#         property_data.book_value = body["book_value"]
#         property_data.estimate_value = body["estimate_value"]
#         property_data.latitude = body["latitude"]
#         property_data.longitude = body["longitude"]
#         property_data.status = body["status"]

#         # ✅ Track existing units for update vs delete
#         existing_units = {str(u.id): u for u in property_data.units}
#         new_unit_ids = set()

#         # ✅ Handle flat list of unit pictures
#         flat_unit_pictures = body.get("unit_pictures", [])
#         pic_offset = 0

#         for unit_data in body["units"] or []:
#             unit_id = str(unit_data.get("id", None))
#             unit_picture_paths = []

#             # Extract `pictures_count` and slice the flat list
#             count = int(unit_data.get("pictures_count", 0))
#             files_for_unit = flat_unit_pictures[pic_offset : pic_offset + count]
#             pic_offset += count

#             # Process both new + existing pictures
#             for pic in unit_data.get("pictures", []) + files_for_unit:
#                 if is_upload_file(pic):
#                     saved_pic = save_uploaded_file(pic, "uploads/units")
#                     unit_picture_paths.append(saved_pic)
#                 elif isinstance(pic, str):
#                     unit_picture_paths.append(pic)

#             # Update or Create unit
#             if unit_id and unit_id in existing_units:
#                 unit = existing_units[unit_id]
#                 unit.name = unit_data["name"]
#                 unit.unit_no = unit_data["unit_no"]
#                 unit.unit_type = unit_data["unit_type"]
#                 unit.size = unit_data["size"]
#                 unit.rent = unit_data["rent"]
#                 unit.description = unit_data["description"]
#                 unit.pictures = unit_picture_paths
#                 unit.bedrooms = unit_data["bedrooms"]
#                 unit.bathrooms = unit_data["bathrooms"]
#                 unit.water_meter = unit_data["water_meter"]
#                 unit.electricity_meter = unit_data["electricity_meter"]

#                 unit.account_name = unit_data["account_name"]
#                 unit.account_no = unit_data["account_no"]
#                 unit.bank_name = unit_data["bank_name"]
#                 unit.status = unit_data["status"]
#                 new_unit_ids.add(unit_id)
#             else:
#                 new_unit = PropertyUnitModel(
#                     id=uuid4(),
#                     property_id=property_id,
#                     name=unit_data["name"],
#                     unit_no=unit_data["unit_no"],
#                     unit_type=unit_data["unit_type"],
#                     size=unit_data["size"],
#                     rent=unit_data["rent"],
#                     description=unit_data["description"],
#                     pictures=unit_picture_paths,
#                     bedrooms=unit_data["bedrooms"],
#                     bathrooms=unit_data["bathrooms"],
#                     water_meter=unit_data["water_meter"],
#                     account_name=unit_data["account_name"],
#                     account_no=unit_data["account_no"],
#                     bank_name=unit_data["bank_name"],
#                     electricity_meter=unit_data["electricity_meter"],
#                     status=unit_data["status"],
#                 )
#                 db.add(new_unit)

#         # ✅ Remove deleted units
#         for existing_unit_id, unit in existing_units.items():
#             if existing_unit_id not in new_unit_ids:
#                 db.delete(unit)

#         db.commit()
#         db.refresh(property_data)

#         property_data = (
#             db.query(PropertyModel)
#             .options(joinedload(PropertyModel.units))
#             .filter_by(id=property_id)
#             .first()
#         )
#         return {
#             "success": True,
#             "message": "Property updated successfully.",
#             "items": jsonable_encoder(property_data),
#         }

#     except SQLAlchemyError as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# def update_property(db: Session, property_id: UUID, body):
#     try:
#         property_data = db.query(PropertyModel).filter_by(id=property_id).first()
#         if not property_data:
#             raise HTTPException(status_code=404, detail="Property not found")

#         picture_paths = []
#         try:
#             for pic in body.get("pictures", []):
#                 if is_upload_file(pic):
#                     saved_name = save_uploaded_file(pic, "uploads/properties")
#                     picture_paths.append(saved_name)
#                 elif isinstance(pic, str):
#                     picture_paths.append(pic)
#         except Exception as e:
#             error_log(e, "Failed to process property pictures")
#             raise HTTPException(
#                 status_code=500, detail="Error while saving property pictures."
#             )

#         # ✅ Update only non-null fields
#         updatable_fields = [
#             "name",
#             "city",
#             "governance",
#             "address",
#             "address2",
#             "description",
#             "property_type",
#             "type",
#             "paci_no",
#             "property_no",
#             "civil_no",
#             "build_year",
#             "book_value",
#             "estimate_value",
#             "latitude",
#             "longitude",
#             "status",
#             "is_active",
#             "unit_counts",
#             "email",
#             "phone",
#             "bank_name",
#             "account_no",
#             "iban_no",
#             "account_name",
#         ]
#         for field in updatable_fields:
#             if field in body and body[field] is not None:
#                 setattr(property_data, field, body[field])

#         if picture_paths:
#             property_data.pictures = picture_paths

#         # ✅ Unit handling (skip if not passed)
#         if "units" in body:
#             existing_units = {str(u.id): u for u in property_data.units}
#             new_unit_ids = set()

#             flat_unit_pictures = body.get("unit_pictures", [])
#             pic_offset = 0

#             for unit_data in body["units"] or []:
#                 unit_id = str(unit_data.get("id", None))
#                 unit_picture_paths = []

#                 count = int(unit_data.get("pictures_count", 0))
#                 files_for_unit = flat_unit_pictures[pic_offset : pic_offset + count]
#                 pic_offset += count

#                 for pic in unit_data.get("pictures", []) + files_for_unit:
#                     if is_upload_file(pic):
#                         saved_pic = save_uploaded_file(pic, "uploads/units")
#                         unit_picture_paths.append(saved_pic)
#                     elif isinstance(pic, str):
#                         unit_picture_paths.append(pic)

#             # Update or Create unit
#             if unit_id and unit_id in existing_units:
#                 unit = existing_units[unit_id]
#                 unit.name = unit_data["name"]
#                 unit.unit_no = unit_data["unit_no"]
#                 unit.unit_type = unit_data["unit_type"]
#                 unit.size = unit_data["size"]
#                 unit.rent = unit_data["rent"]
#                 unit.description = unit_data["description"]
#                 unit.pictures = unit_picture_paths
#                 unit.bedrooms = unit_data["bedrooms"]
#                 unit.bathrooms = unit_data["bathrooms"]
#                 unit.water_meter = unit_data["water_meter"]
#                 unit.electricity_meter = unit_data["electricity_meter"]
#                 unit.status = unit_data["status"]
#                 new_unit_ids.add(unit_id)
#             else:
#                 new_unit = PropertyUnitModel(
#                     id=uuid4(),
#                     property_id=property_id,
#                     name=unit_data["name"],
#                     unit_no=unit_data["unit_no"],
#                     unit_type=unit_data["unit_type"],
#                     size=unit_data["size"],
#                     rent=unit_data["rent"],
#                     description=unit_data["description"],
#                     pictures=unit_picture_paths,
#                     bedrooms=unit_data["bedrooms"],
#                     bathrooms=unit_data["bathrooms"],
#                     water_meter=unit_data["water_meter"],
#                     electricity_meter=unit_data["electricity_meter"],
#                     status=unit_data["status"],
#                 )
#                 db.add(new_unit)

#             for existing_unit_id, unit in existing_units.items():
#                 if existing_unit_id not in new_unit_ids:
#                     db.delete(unit)

#         db.commit()
#         db.refresh(property_data)

#         property_data = (
#             db.query(PropertyModel)
#             .options(joinedload(PropertyModel.units))
#             .filter_by(id=property_id)
#             .first()
#         )

#         return {
#             "success": True,
#             "message": "Property updated successfully.",
#             "items": jsonable_encoder(property_data),
#         }

#     except SQLAlchemyError as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def update_property(db: Session, property_id: UUID, body):
    try:
        property_data = db.query(PropertyModel).filter_by(id=property_id).first()
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")

        # -----------------------
        # Property-level pictures
        # -----------------------
        new_prop_picture_paths: list[str] = []
        try:
            incoming_prop_files = body.get("pictures", [])
            # normalize to list
            if incoming_prop_files and not isinstance(
                incoming_prop_files, (list, tuple)
            ):
                incoming_prop_files = [incoming_prop_files]

            for pic in incoming_prop_files:
                if is_upload_file(pic):
                    saved_name = save_uploaded_file(pic, "uploads/properties")
                    new_prop_picture_paths.append(saved_name)
                elif isinstance(pic, str) and pic:
                    # seldom sent here, usually in 'existing_pictures'
                    new_prop_picture_paths.append(pic)
        except Exception as e:
            error_log(e, "Failed to process property pictures")
            raise HTTPException(
                status_code=500, detail="Error while saving property pictures."
            )

        # Merge existing property pictures (string paths) + new uploaded
        existing_pictures = body.get("existing_pictures", [])
        if isinstance(existing_pictures, str):
            try:
                existing_pictures = json.loads(existing_pictures or "[]")
            except Exception:
                existing_pictures = []
        if not isinstance(existing_pictures, list):
            existing_pictures = []

        final_property_pictures = (existing_pictures or []) + (
            new_prop_picture_paths or []
        )
        if final_property_pictures:
            property_data.pictures = final_property_pictures

        # -----------------------
        # Update primitive fields
        # -----------------------
        updatable_fields = [
            "name",
            "city",
            "governance",
            "address",
            "address2",
            "description",
            "property_type",
            "type",
            "paci_no",
            "property_no",
            "civil_no",
            "build_year",
            "book_value",
            "estimate_value",
            "latitude",
            "longitude",
            "status",
            "is_active",
            "unit_counts",
            "email",
            "phone",
            "bank_name",
            "account_no",
            "iban_no",
            "account_name",
        ]
        for field in updatable_fields:
            if field in body and body[field] is not None:
                setattr(property_data, field, body[field])

        # -----------------------------------------
        # Units: parse input from FormData payloads
        # -----------------------------------------
        # Frontend sends multiple "units_data" entries (each JSON string) OR a "units" list of dicts.
        units_payload = []
        if "units" in body and isinstance(body["units"], list):
            units_payload = body["units"]
        else:
            raw_units_data = body.get("units_data", [])
            if raw_units_data and not isinstance(raw_units_data, (list, tuple)):
                raw_units_data = [raw_units_data]
            for item in raw_units_data or []:
                if isinstance(item, str):
                    try:
                        units_payload.append(json.loads(item))
                    except Exception:
                        continue
                elif isinstance(item, dict):
                    units_payload.append(item)

        # Pictures for units come as a flat list in the order of the units, with counts per unit
        flat_unit_files = body.get("unit_pictures", [])
        if flat_unit_files and not isinstance(flat_unit_files, (list, tuple)):
            flat_unit_files = [flat_unit_files]

        # Existing unit pictures mapping: {"0": ["path1", ...], "1": [...]} keyed by index in units_payload
        existing_unit_pictures = body.get("existing_unit_pictures", {})
        if isinstance(existing_unit_pictures, str):
            try:
                existing_unit_pictures = json.loads(existing_unit_pictures or "{}")
            except Exception:
                existing_unit_pictures = {}
        if not isinstance(existing_unit_pictures, dict):
            existing_unit_pictures = {}

        # Explicitly removed unit ids (string UUIDs)
        removed_unit_ids = body.get("removed_unit_ids", [])
        if isinstance(removed_unit_ids, str):
            try:
                removed_unit_ids = json.loads(removed_unit_ids or "[]")
            except Exception:
                removed_unit_ids = []
        if not isinstance(removed_unit_ids, list):
            removed_unit_ids = []

        # -----------------------
        # Update / Create units
        # -----------------------
        existing_units: dict[str, PropertyUnitModel] = {
            str(u.id): u for u in property_data.units
        }
        new_or_kept_unit_ids: set[str] = set()

        pic_offset = 0
        for idx, unit_data in enumerate(units_payload or []):
            # normalize types and defaults
            unit_id = str(unit_data.get("id")) if unit_data.get("id") else None

            # Gather files for this unit from the flattened list
            pictures_count = unit_data.get("pictures_count", 0)
            try:
                pictures_count = int(pictures_count)
            except Exception:
                pictures_count = 0

            files_for_unit = list(
                flat_unit_files[pic_offset : pic_offset + pictures_count]
            )
            pic_offset += pictures_count

            # Start with existing (kept) picture paths for this index
            unit_picture_paths: list[str] = []
            existing_paths_for_idx = existing_unit_pictures.get(str(idx), [])
            if isinstance(existing_paths_for_idx, list):
                unit_picture_paths.extend(
                    [p for p in existing_paths_for_idx if isinstance(p, str) and p]
                )

            # Save uploaded files for this unit
            for f in files_for_unit:
                if is_upload_file(f):
                    saved = save_uploaded_file(f, "uploads/units")
                    unit_picture_paths.append(saved)

            # If the unit payload also contained string paths in "pictures", add them too
            for p in unit_data.get("pictures", []) or []:
                if isinstance(p, str) and p:
                    unit_picture_paths.append(p)

            # Update or create
            if unit_id and unit_id in existing_units:
                unit = existing_units[unit_id]
                # update only provided fields (fallback to current)
                unit.name = unit_data.get("name", unit.name)
                unit.unit_no = unit_data.get("unit_no", unit.unit_no)
                unit.unit_type = unit_data.get("unit_type", unit.unit_type)
                unit.size = unit_data.get("size", unit.size)
                unit.rent = unit_data.get("rent", unit.rent)
                unit.description = unit_data.get("description", unit.description)
                unit.bedrooms = unit_data.get("bedrooms", unit.bedrooms)
                unit.bathrooms = unit_data.get("bathrooms", unit.bathrooms)
                unit.water_meter = unit_data.get("water_meter", unit.water_meter)
                unit.electricity_meter = unit_data.get(
                    "electricity_meter", unit.electricity_meter
                )
                unit.status = unit_data.get("status", unit.status)
                # replace pictures with combined list for this update cycle
                unit.pictures = unit_picture_paths
                new_or_kept_unit_ids.add(unit_id)
            else:
                # create new
                new_unit = PropertyUnitModel(
                    id=uuid4(),
                    property_id=property_id,
                    name=unit_data.get("name", ""),
                    unit_no=unit_data.get("unit_no", ""),
                    unit_type=unit_data.get("unit_type", ""),
                    size=unit_data.get("size", ""),
                    rent=unit_data.get("rent", ""),
                    description=unit_data.get("description", ""),
                    pictures=unit_picture_paths,
                    bedrooms=unit_data.get("bedrooms", ""),
                    bathrooms=unit_data.get("bathrooms", ""),
                    water_meter=unit_data.get("water_meter", ""),
                    electricity_meter=unit_data.get("electricity_meter", ""),
                    status=unit_data.get("status", "available"),
                )
                db.add(new_unit)

        # ------------------------------------------
        # Deletions: ONLY delete what client asked to
        # ------------------------------------------
        for rid in removed_unit_ids:
            rid = str(rid)
            if rid in existing_units and rid not in new_or_kept_unit_ids:
                db.delete(existing_units[rid])

        db.commit()
        db.refresh(property_data)

        # return with units eager-loaded
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


def get_property(
    db: Session,
    property_id: str,
    user_id: Optional[str] = None,
    role_id: Optional[str] = None,
):
    # Load property + units
    property_data = (
        db.query(PropertyModel)
        .options(selectinload(PropertyModel.units))
        .filter(PropertyModel.id == property_id)
        .first()
    )

    if not property_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found",
        )

    # Start with active units only
    units = [u for u in property_data.units if u.is_active]

    # If this endpoint is used by Managers, keep only their assigned units
    if role_id == "Manager" and user_id:
        assigned_unit_ids = [
            row[0]
            for row in db.query(Manager.assign_property_unit)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .all()
        ]
        assigned_unit_id_set = set(assigned_unit_ids)
        units = [u for u in units if u.id in assigned_unit_id_set]

    # (Optional) enrich units here if you want; keeping original structure:
    units_dict = [jsonable_encoder(u) for u in units]

    # Build response object and override unit_counts
    prop_dict = jsonable_encoder(property_data)
    prop_dict["units"] = units_dict
    prop_dict["unit_counts"] = len(units_dict)  # ✅ FIX

    return {
        "success": True,
        "message": "Property retrieved successfully.",
        "property": prop_dict,
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


def enrich_unit_with_tenant_info(
    db: Session, unit: PropertyUnitModel
) -> PropertyUnitOut:
    tenant = (
        db.query(Tenant)
        .filter(
            Tenant.property_unit_id == unit.id,
            Tenant.is_approved == True,
        )
        .first()
    )

    assigned_user_id = None
    assigned_user_name = None
    if tenant:
        assigned_user = db.query(User).filter(User.id == tenant.user_id).first()
        if assigned_user:
            assigned_user_id = str(assigned_user.id)
            assigned_user_name = f"{assigned_user.fname} {assigned_user.lname}"

    unit_data = unit.__dict__.copy()
    unit_data["assignedUnitUserId"] = assigned_user_id
    unit_data["assignedUnitUserName"] = assigned_user_name

    return PropertyUnitOut(**unit_data)


# def get_properties_super_admin_view(
#     db: Session,
#     user_id: Optional[str] = None,
#     role_id: Optional[str] = None,
#     page: int = 1,
#     size: int = 20,
#     search: Optional[str] = None,
# ):
#     query = db.query(PropertyModel).options(selectinload(PropertyModel.units))

#     # For Manager role, collect assigned unit ids first
#     assigned_unit_ids = []
#     if role_id == "Manager":
#         managers = (
#             db.query(Manager)
#             .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
#             .all()
#         )
#         for m in managers:
#             if m.assign_property_unit:
#                 assigned_unit_ids.append(m.assign_property_unit)
#         assigned_unit_ids = list(set(assigned_unit_ids))

#         if not assigned_unit_ids:
#             return {
#                 "success": True,
#                 "total": 0,
#                 "page": page,
#                 "size": size,
#                 "items": [],
#             }

#         allowed_property_ids = (
#             db.query(PropertyUnitModel.property_id)
#             .filter(
#                 PropertyUnitModel.id.in_(assigned_unit_ids),
#                 # PropertyUnitModel.is_active == True,
#             )
#             .distinct()
#             .all()
#         )

#         allowed_property_ids = [pid[0] for pid in allowed_property_ids]
#         query = query.filter(PropertyModel.id.in_(allowed_property_ids))

#     elif role_id == "Landlord":
#         user = db.query(User).filter(User.id == user_id).first()
#         if not user or not user.landlord_id:
#             return {
#                 "success": True,
#                 "total": 0,
#                 "page": page,
#                 "size": size,
#                 "items": [],
#             }
#         landlord_id = user.landlord_id
#         query = query.filter(PropertyModel.landlord_id == landlord_id)

#     if search:
#         search_term = f"%{search}%"
#         query = query.filter(
#             PropertyModel.name.ilike(search_term)
#             | PropertyModel.address.ilike(search_term)
#         )

#     total = query.count()
#     properties = (
#         query.order_by(PropertyModel.created_at.desc())
#         .offset((page - 1) * size)
#         .limit(size)
#         .all()
#     )

#     results = []

#     for prop in properties:
#         # Filter active units
#         # units = [unit for unit in prop.units if unit.is_active]
#         units = prop.units

#         if role_id == "Manager":
#             units = [unit for unit in units if unit.id in assigned_unit_ids]

#         # Enrich each unit
#         validated_units = [enrich_unit_with_tenant_info(db, unit) for unit in units]

#         # Build final PropertyOut dict
#         prop_dict = prop.__dict__.copy()
#         prop_dict["units"] = validated_units
#         results.append(PropertyOut(**prop_dict))

#     return {
#         "success": True,
#         "total": total,
#         "page": page,
#         "size": size,
#         "items": results,
#     }


def get_properties(
    db: Session,
    user_id: Optional[str] = None,
    role_id: Optional[str] = None,
    page: int = 1,
    size: int = 20,
    search: Optional[str] = None,
):
    query = (
        db.query(PropertyModel)
        .options(selectinload(PropertyModel.units))
        .filter(PropertyModel.is_active == True)
    )

    # For Manager role, collect assigned unit ids first
    assigned_unit_ids: List[str] = []
    if role_id == "Manager":
        managers = (
            db.query(Manager)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .all()
        )
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

        allowed_property_ids = (
            db.query(PropertyUnitModel.property_id)
            .filter(
                PropertyUnitModel.id.in_(assigned_unit_ids),
                PropertyUnitModel.is_active == True,
            )
            .distinct()
            .all()
        )
        allowed_property_ids = [pid[0] for pid in allowed_property_ids]
        query = query.filter(PropertyModel.id.in_(allowed_property_ids))

    elif role_id == "Landlord":
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
        query = query.filter(PropertyModel.landlord_id == landlord_id)

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

    results: List[PropertyOut] = []

    assigned_unit_id_set = set(assigned_unit_ids)

    for prop in properties:
        # --- filter active units
        units = [u for u in prop.units if u.is_active]
        if role_id == "Manager":
            units = [u for u in units if u.id in assigned_unit_id_set]

        # landlord name
        landlord_user = (
            db.query(User).filter(User.landlord_id == prop.landlord_id).first()
        )
        landlord_name = (
            f"{landlord_user.fname} {landlord_user.lname}" if landlord_user else None
        )

        # enrich each unit
        enriched_units = []
        for unit in units:
            unit_out = enrich_unit_with_tenant_info(db, unit)

            # assigned manager name
            manager = (
                db.query(Manager)
                .filter(Manager.assign_property_unit == unit.id)
                .first()
            )
            assigned_manager_name = None
            if manager:
                manager_user = (
                    db.query(User).filter(User.id == manager.manager_user_id).first()
                )
                if manager_user:
                    assigned_manager_name = f"{manager_user.fname} {manager_user.lname}"

            unit_out = unit_out.copy(
                update={"assignedManagerName": assigned_manager_name}
            )
            enriched_units.append(unit_out)

        # --- build response object
        prop_dict = prop.__dict__.copy()
        prop_dict["units"] = enriched_units
        prop_dict["landlord_name"] = landlord_name

        # ✅ FIX: override unit_counts with computed count (after filtering)
        prop_dict["unit_counts"] = len(enriched_units)

        results.append(PropertyOut(**prop_dict))

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": results,
    }


def get_properties_super_admin_view(
    db: Session,
    user_id: Optional[str] = None,
    role_id: Optional[str] = None,
    page: int = 1,
    size: int = 20,
    search: Optional[str] = None,
):
    query = db.query(PropertyModel).options(selectinload(PropertyModel.units))

    # For Manager role, collect assigned unit ids first
    assigned_unit_ids = []
    if role_id == "Manager":
        managers = (
            db.query(Manager)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .all()
        )
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

        allowed_property_ids = (
            db.query(PropertyUnitModel.property_id)
            .filter(PropertyUnitModel.id.in_(assigned_unit_ids))
            .distinct()
            .all()
        )
        allowed_property_ids = [pid[0] for pid in allowed_property_ids]
        query = query.filter(PropertyModel.id.in_(allowed_property_ids))

    elif role_id == "Landlord":
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
        query = query.filter(PropertyModel.landlord_id == landlord_id)

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
        units = prop.units

        if role_id == "Manager":
            units = [unit for unit in units if unit.id in assigned_unit_ids]

        # Enrich each unit with tenant info + assigned manager name
        validated_units = []
        for unit in units:
            unit_data = enrich_unit_with_tenant_info(db, unit)
            manager = (
                db.query(Manager)
                .filter(
                    Manager.assign_property_unit == unit.id, Manager.is_active == True
                )
                .first()
            )
            assigned_manager_name = None
            if manager:
                manager_user = (
                    db.query(User).filter(User.id == manager.manager_user_id).first()
                )
                if manager_user:
                    assigned_manager_name = f"{manager_user.fname} {manager_user.lname}"
            unit_data = unit_data.copy(
                update={"assignedManagerName": assigned_manager_name}
            )
            validated_units.append(unit_data)

        # Get landlord name
        landlord_name = None
        if prop.landlord_id:
            landlord_user = (
                db.query(User).filter(User.landlord_id == prop.landlord_id).first()
            )
            if landlord_user:
                landlord_name = f"{landlord_user.fname} {landlord_user.lname}"

        # Build property dict with landlord_name
        prop_dict = prop.__dict__.copy()
        prop_dict["units"] = validated_units
        prop_dict["landlord_name"] = landlord_name

        results.append(PropertyOut(**prop_dict))

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


def toggle_property_status(db: Session, property_id: UUID, is_active: bool):
    try:
        # 1. Update property status
        updated_rows = (
            db.query(PropertyModel)
            .filter(PropertyModel.id == property_id)
            .update({"is_active": is_active}, synchronize_session=False)
        )

        if updated_rows == 0:
            raise HTTPException(status_code=404, detail="Property not found")

        # 2. Update all related property units status
        db.query(PropertyUnitModel).filter(
            PropertyUnitModel.property_id == property_id
        ).update({"is_active": is_active}, synchronize_session=False)

        # 3. Update all tenants related to those units
        db.query(Tenant).filter(
            Tenant.property_unit_id.in_(
                db.query(PropertyUnitModel.id).filter(
                    PropertyUnitModel.property_id == property_id
                )
            )
        ).update({"is_active": is_active}, synchronize_session=False)

        db.commit()

        return {
            "success": True,
            "message": f"Property, its units, and tenants have been {'activated' if is_active else 'deactivated'}.",
            "property_id": str(property_id),
            "is_active": is_active,
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
