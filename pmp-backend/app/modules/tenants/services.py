from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from app.models.tenants import Tenant
from app.models.property_units import PropertyUnit
from app.models.users import User
from fastapi import HTTPException
from app.modules.tenants.schemas import (
    ContractCreate,
    ContractListOut,
    ContractCreateOut,
)
from datetime import date
import uuid
from uuid import UUID
from typing import List, Optional
from sqlalchemy import or_


def create_contracts_for_user(db: Session, data: ContractCreate):
    created_contracts = []

    try:
        for unit_id in data.property_unit_ids:
            # Check if this unit is already assigned to another user with overlapping contract
            existing_contract = (
                db.query(Tenant)
                .filter(
                    Tenant.property_unit_id == unit_id,
                    Tenant.contract_end >= date.today(),
                )
                .first()
            )

            if existing_contract:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unit {unit_id} is already assigned to another user until {existing_contract.contract_end}.",
                )

            tenant_contract = Tenant(
                id=uuid.uuid4(),
                user_id=data.user_id,
                property_unit_id=unit_id,
                tenant_type=data.tenant_type,
                civil_id=data.civil_id,
                nationality=data.nationality,
                legal_case=data.legal_case,
                is_approved=data.is_approved,
                language=data.language,
                contract_start=data.contract_start,
                contract_end=data.contract_end,
                contract_number=data.contract_number,
                rent_price=data.rent_price,
                rent_pay_day=data.rent_pay_day,
                payment_cycle=data.payment_cycle,
                leaving_date=data.leaving_date,
                is_active=True,
            )
            db.add(tenant_contract)
            created_contracts.append(tenant_contract)

        db.commit()
        return [ContractCreateOut.model_validate(c) for c in created_contracts]

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


def list_contracts_by_approval(
    db: Session,
    is_approved: bool,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
):
    query = (
        db.query(Tenant)
        .filter(Tenant.is_approved == is_approved)
        .join(User, User.id == Tenant.user_id)
        .options(joinedload(Tenant.user))
    )

    if search:
        like_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.fname.ilike(like_term),
                User.lname.ilike(like_term),
                User.email.ilike(like_term),
                User.phone.ilike(like_term),
            )
        )

    total = query.count()
    contracts = query.offset((page - 1) * size).limit(size).all()

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
        "total": total,
        "page": page,
        "size": size,
        "items": result,
    }
