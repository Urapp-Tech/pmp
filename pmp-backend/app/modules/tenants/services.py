from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from app.models.tenants import Tenant
from app.models.users import User
from app.models.properties import Property
from app.models.roles import Role
from app.models.property_units import PropertyUnit
from fastapi import HTTPException, UploadFile
from app.utils.uploader import is_upload_file, save_uploaded_file
from datetime import datetime
from app.modules.tenants.schemas import (
    ContractCreate,
    ContractUpdate,
    ContractListOut,
    ContractCreateOut,
    UnitDetailOut,
    ContractStandardUpdateResponse,
    PropertyInfo,
    UnitDetail,
)
from datetime import date
import uuid
from uuid import UUID
from typing import List, Optional
from sqlalchemy import or_


def create_contract_for_user(
    db: Session, data: ContractCreate, agreement_doc: Optional[UploadFile] = None
):
    try:
        existing_contract = (
            db.query(Tenant)
            .join(PropertyUnit, Tenant.property_unit_id == PropertyUnit.id)
            .filter(
                Tenant.property_unit_id == data.property_unit_id,
                Tenant.contract_end >= date.today(),
                Tenant.is_active == True,
            )
            .first()
        )
        if existing_contract:
            unit_name = (
                existing_contract.property_unit.name
                if existing_contract.property_unit
                else "Unknown Unit"
            )
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unit '{unit_name}' is already on pending approval to another user."
                ),
            )
        year = date.today().year
        count = (
            db.query(Tenant)
            .filter(Tenant.contract_number.ilike(f"CNT-{year}-%"))
            .count()
        )
        sequence = count + 1
        contract_number = f"CNT-{year}-{str(sequence).zfill(3)}"
        try:
            file_url = None
            if is_upload_file(agreement_doc):
                file_url = save_uploaded_file(
                    agreement_doc, upload_dir="uploads/agreement_docs"
                )
        except Exception as e:
            db.rollback()
            print(e)
            raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")
        tenant_contract = Tenant(
            id=uuid.uuid4(),
            user_id=data.user_id,
            property_unit_id=data.property_unit_id,
            tenant_type=data.tenant_type,
            civil_id=data.civil_id,
            nationality=data.nationality,
            legal_case=data.legal_case,
            is_approved=data.is_approved,
            language=data.language,
            contract_start=data.contract_start,
            contract_end=data.contract_end,
            contract_number=contract_number,
            rent_price=data.rent_price,
            rent_pay_day=data.rent_pay_day,
            payment_cycle=data.payment_cycle,
            leaving_date=data.leaving_date,
            is_active=True,
            agreement_doc=file_url,
        )
        db.add(tenant_contract)
        db.commit()
        db.refresh(tenant_contract)
        return ContractCreateOut.model_validate(tenant_contract)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


def update_contract_for_user(
    db: Session,
    contract_id: UUID,
    data: ContractUpdate,
    agreement_doc: Optional[UploadFile] = None,
):
    try:
        # 1. Find existing contract
        tenant_contract = db.query(Tenant).filter(Tenant.id == contract_id).first()
        if not tenant_contract:
            raise HTTPException(status_code=404, detail="Contract not found")

        old_unit_id: Optional[UUID] = tenant_contract.property_unit_id

        # 2. Keep existing docs as list (from comma-separated string)
        existing_docs = []
        if tenant_contract.agreement_doc:
            existing_docs = tenant_contract.agreement_doc.split(",")

        # 3. If new agreement_doc is uploaded, save and append
        if is_upload_file(agreement_doc):
            new_file_url = save_uploaded_file(
                agreement_doc, upload_dir="uploads/agreement_docs"
            )
            existing_docs.append(new_file_url)

        # 4. Update fields from incoming data
        # tenant_contract.user_id = data.user_id
        tenant_contract.property_unit_id = data.property_unit_id
        tenant_contract.tenant_type = data.tenant_type
        tenant_contract.civil_id = data.civil_id
        tenant_contract.nationality = data.nationality
        tenant_contract.legal_case = data.legal_case
        # tenant_contract.is_approved = data.is_approved
        tenant_contract.language = data.language
        tenant_contract.contract_start = data.contract_start
        tenant_contract.contract_end = data.contract_end
        tenant_contract.rent_price = data.rent_price
        tenant_contract.rent_pay_day = data.rent_pay_day
        tenant_contract.payment_cycle = data.payment_cycle
        tenant_contract.leaving_date = data.leaving_date
        tenant_contract.updated_at = datetime.utcnow()

        # 5. Save updated list as comma-separated string
        tenant_contract.agreement_doc = ",".join(existing_docs)

        new_unit_id: Optional[UUID] = data.property_unit_id

        def set_available(unit_obj):
            # supports either a string 'status' or boolean 'is_occupied'
            if hasattr(unit_obj, "status"):
                unit_obj.status = "available"
            if hasattr(unit_obj, "is_occupied"):
                unit_obj.is_occupied = False

        def set_occupied(unit_obj):
            if hasattr(unit_obj, "status"):
                unit_obj.status = "occupied"
            if hasattr(unit_obj, "is_occupied"):
                unit_obj.is_occupied = True

        unit = None  # we'll reuse this for response building

        if new_unit_id and new_unit_id != old_unit_id:
            # 6a) Release old unit
            if old_unit_id:
                prev_unit = (
                    db.query(PropertyUnit)
                    .filter(PropertyUnit.id == old_unit_id)
                    .first()
                )
                if prev_unit:
                    set_available(prev_unit)

            # 6b) Occupy new unit
            unit = db.query(PropertyUnit).filter(PropertyUnit.id == new_unit_id).first()
            if not unit:
                db.rollback()
                raise HTTPException(
                    status_code=404, detail="New property unit not found"
                )

            set_occupied(unit)
        else:
            # No change or no new unit id; fetch current unit for response (if any)
            if tenant_contract.property_unit_id:
                unit = (
                    db.query(PropertyUnit)
                    .filter(PropertyUnit.id == tenant_contract.property_unit_id)
                    .first()
                )

        db.commit()
        db.refresh(tenant_contract)

        # 6. Fetch unit details for the response
        # unit = (
        #     db.query(PropertyUnit)
        #     .filter(PropertyUnit.id == tenant_contract.property_unit_id)
        #     .first()
        # )
        property_info = None
        if unit and unit.property_id:
            property_row = (
                db.query(Property).filter(Property.id == unit.property_id).first()
            )
            if property_row:
                property_info = PropertyInfo(id=property_row.id, name=property_row.name)

        unit_detail = None
        if unit:
            unit_detail = UnitDetail(
                id=unit.id,
                name=unit.name,
                unitNo=unit.unit_no,
                unitType=unit.unit_type,
                size=unit.size,
                electricityMeter=unit.electricity_meter,
                waterMeter=unit.water_meter,
                pictures=(
                    unit.pictures.split(",") if getattr(unit, "pictures", None) else []
                ),
                rent=str(unit.rent),
                property=property_info,
            )

            # 7. Build response ContractUpdate object
            contract_update_response = ContractUpdate(
                property_unit_id=tenant_contract.property_unit_id,
                contract_start=tenant_contract.contract_start,
                contract_end=tenant_contract.contract_end,
                rent_price=(
                    float(tenant_contract.rent_price)
                    if tenant_contract.rent_price is not None
                    else 0.0
                ),
                rent_pay_day=(
                    int(tenant_contract.rent_pay_day)
                    if tenant_contract.rent_pay_day is not None
                    else 0
                ),
                payment_cycle=tenant_contract.payment_cycle,
                leaving_date=tenant_contract.leaving_date,
                civil_id=tenant_contract.civil_id,
                tenant_type=tenant_contract.tenant_type,
                nationality=tenant_contract.nationality,
                legal_case=(
                    bool(tenant_contract.legal_case)
                    if tenant_contract.legal_case is not None
                    else False
                ),
                is_approved=(
                    bool(tenant_contract.is_approved)
                    if tenant_contract.is_approved is not None
                    else False
                ),
                language=tenant_contract.language,
                agreement_doc=existing_docs,
                unit_detail=unit_detail,
            )

        return ContractStandardUpdateResponse(
            success=True,
            message="Contract updated successfully",
            data=contract_update_response,
        )

        # return ContractCreateOut.model_validate(tenant_contract)

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


def approve_contract_unit(
    db: Session, user_id: UUID, property_unit_id: UUID, is_approved: bool
):
    tenant_contract = (
        db.query(Tenant)
        .filter(Tenant.user_id == user_id, Tenant.property_unit_id == property_unit_id)
        .first()
    )
    if not tenant_contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found for the given user and property unit.",
        )
    if tenant_contract.is_approved and is_approved:
        raise HTTPException(status_code=400, detail="Contract already approved.")
    tenant_contract.is_approved = is_approved
    if is_approved:
        unit = (
            db.query(PropertyUnit).filter(PropertyUnit.id == property_unit_id).first()
        )
        if not unit:
            raise HTTPException(status_code=404, detail="Property unit not found.")
        if unit.status == "occupied":
            raise HTTPException(status_code=400, detail="Unit already occupied.")
        unit.status = "occupied"
    else:
        tenant_contract.is_active = False
    db.commit()
    return {"success": True, "message": "Contract approval updated successfully."}


def list_contracts_by_landlord(
    db: Session,
    landlord_id: UUID,
    is_approved: bool,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
):
    user_role = db.query(Role).filter(Role.name == "User").first()
    if not user_role:
        raise HTTPException(status_code=400, detail="User role not found.")
    user_ids = (
        db.query(User.id)
        .filter(User.landlord_id == landlord_id, User.role_id == user_role.id)
        .all()
    )
    user_ids = [u[0] for u in user_ids]
    if not user_ids:
        return {
            "success": True,
            "total": 0,
            "page": page,
            "size": size,
            "items": [],
        }
    query = (
        db.query(Tenant)
        .options(
            joinedload(Tenant.user),  # Eager load related User
            joinedload(Tenant.property_unit).joinedload(
                PropertyUnit.property
            ),  # Nested eager load PropertyUnit → Property
        )
        .filter(
            Tenant.user_id.in_(user_ids),  # Filter by user_ids
            Tenant.is_approved == is_approved,  # Approved status filter
            Tenant.is_active == True,  # Only active tenants
        )
    )
    if search:
        search_term = f"%{search.strip()}%"
        query = query.join(User, Tenant.user_id == User.id).filter(
            or_(
                User.fname.ilike(search_term),
                User.lname.ilike(search_term),
                User.email.ilike(search_term),
                User.phone.ilike(search_term),
                Tenant.contract_number.ilike(search_term),
            )
        )
    total = query.count()
    contracts = (
        query.order_by(Tenant.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    result: List[ContractListOut] = []
    for contract in contracts:
        user = contract.user
        unit = contract.property_unit
        user_data = {
            "id": user.id,
            "fname": user.fname,
            "lname": user.lname,
            "email": user.email,
            "phone": user.phone,
            "gender": user.gender,
            "profile_pic": user.profile_pic,
        }
        unit_data = None
        if unit:
            unit_data = UnitDetailOut.model_validate(unit)
        contract_out = ContractListOut.model_validate(contract)
        if contract.agreement_doc:
            contract_out.agreement_doc = contract.agreement_doc.split(",")
        contract_out.user_detail = user_data
        contract_out.unit_detail = unit_data
        result.append(contract_out)
    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": result,
    }


def select_list_contracts_by_landlord(db: Session, landlord_id: UUID):
    query = (
        db.query(Tenant)
        .join(User, User.id == Tenant.user_id)
        .filter(Tenant.is_approved == True)
        .filter(User.landlord_id == landlord_id)
        .options(joinedload(Tenant.user))
    )
    result = query.all()
    # result: List[ContractListOut] = []
    # for contract in contracts:
    #     user = contract.user
    #     user_data = {
    #         "id": user.id,
    #         "fname": user.fname,
    #         "lname": user.lname,
    #         "email": user.email,
    #         "phone": user.phone,
    #         "gender": user.gender,
    #         "profile_pic": user.profile_pic,
    #     }
    #     contract_out = ContractListOut.model_validate(contract)
    #     contract_out.user_detail = user_data
    #     result.append(contract)
    return {
        "success": True,
        "total": len(result),
        "items": result,
    }
