from fastapi import APIRouter, Depends, Query
from pydantic import UUID4
from sqlalchemy.orm import Session
from app.modules.tenants.schemas import (
    ContractCreate,
    ContractCreateOut,
    ContractApprovalIn,
    PaginatedContractList,
)
from app.modules.tenants.services import (
    create_contracts_for_user,
    approve_contract_unit,
    list_contracts_by_approval,
    select_list_contracts_by_landlord,
)
from app.db.database import get_db
from typing import List, Optional

router = APIRouter()


@router.post(
    "/contract-create",
    response_model=List[ContractCreateOut],
    summary="Create contract(s) for one or more property units",
)
def create_contracts(
    contract_data: ContractCreate,
    db: Session = Depends(get_db),
):
    contracts = create_contracts_for_user(db, contract_data)
    return [c.model_dump(by_alias=True) for c in contracts]


@router.post("/approve", summary="Approve a contract and occupy a unit")
def approve_contract(data: ContractApprovalIn, db: Session = Depends(get_db)):
    return approve_contract_unit(
        db=db,
        user_id=data.user_id,
        property_unit_id=data.property_unit_id,
        is_approved=data.is_approved,
    )


@router.get("/approved-list", response_model=PaginatedContractList)
def get_approved_contracts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, le=100),
    search: Optional[str] = None,
):
    return list_contracts_by_approval(
        db, is_approved=True, page=page, size=size, search=search
    )


@router.get("/pending-list", response_model=PaginatedContractList)
def get_pending_contracts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, le=100),
    search: Optional[str] = None,
):
    return list_contracts_by_approval(
        db, is_approved=False, page=page, size=size, search=search
    )

@router.get("/by-landlord/{landlord_id}")
def get_contracts_by_landlord(
    landlord_id: UUID4,
    db: Session = Depends(get_db),
):
    return select_list_contracts_by_landlord(db, landlord_id)