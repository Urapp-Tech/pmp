from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from app.models.tenants import Tenant
from app.models.users import User
from app.models.roles import Role
from app.models.property_units import PropertyUnit
from fastapi import HTTPException, UploadFile
from app.utils.uploader import is_upload_file, save_uploaded_file
from app.modules.tenants.schemas import (
    ContractCreate,
    ContractListOut,
    ContractCreateOut,
    UnitDetailOut,
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
        .options(joinedload(Tenant.user), joinedload(Tenant.property_unit))
        .filter(
            Tenant.user_id.in_(user_ids),
            Tenant.is_approved == is_approved,
            Tenant.is_active == True,
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


def select_list_contracts_by_landlord(db: Session, landlord_id: int):
    query = (
        db.query(Tenant)
        .join(User, User.id == Tenant.user_id)
        .filter(Tenant.is_approved == True)
        .filter(User.landlord_id == landlord_id)
        .options(joinedload(Tenant.user))
    )
    contracts = query.all()
    result: List[ContractListOut] = []
    for contract in contracts:
        user = contract.user
        user_data = {
            "id": user.id,
            "fname": user.fname,
            "lname": user.lname,
            "email": user.email,
            "phone": user.phone,
            "gender": user.gender,
            "profile_pic": user.profile_pic,
        }
        contract_out = ContractListOut.model_validate(contract)
        contract_out.user_detail = user_data
        result.append(contract_out)
    return {
        "success": True,
        "total": len(result),
        "items": result,
    }
