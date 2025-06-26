from fastapi import (
    APIRouter,
    Depends,
    Query,
    Path,
    Form,
    HTTPException,
    File,
    UploadFile,
)
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date
from pydantic import ValidationError
from app.modules.tenants.schemas import (
    ContractCreate,
    ContractStandardResponse,
    ContractApprovalIn,
    PaginatedContractList,
)
from app.modules.tenants.services import (
    create_contract_for_user,
    approve_contract_unit,
    list_contracts_by_approval,
    select_list_contracts_by_landlord,
    list_contracts_by_landlord,
)
from app.db.database import get_db
from typing import Union, Optional

router = APIRouter()


def parse_contract_create(
    userId: UUID = Form(...),
    propertyUnitId: UUID = Form(...),
    contractStart: date = Form(...),
    contractEnd: date = Form(...),
    rentPrice: float = Form(...),
    rentPayDay: int = Form(...),
    paymentCycle: str = Form(...),
    leavingDate: Optional[date] = Form(None),
    civilId: Optional[str] = Form(None),
    tenantType: Optional[str] = Form(None),
    nationality: Optional[str] = Form(None),
    legalCase: Optional[bool] = Form(False),
    isApproved: Optional[bool] = Form(False),
    language: Optional[str] = Form(None),
    agreementDoc: Union[UploadFile, str] = File(None),
):
    print("agreement_doc", agreementDoc)
    if isinstance(agreementDoc, str) and agreementDoc == "":
        agreementDoc = None
    try:
        contract_data = ContractCreate(
            user_id=userId,
            property_unit_id=propertyUnitId,
            contract_start=contractStart,
            contract_end=contractEnd,
            rent_price=rentPrice,
            rent_pay_day=rentPayDay,
            payment_cycle=paymentCycle,
            leaving_date=leavingDate,
            civil_id=civilId,
            tenant_type=tenantType,
            nationality=nationality,
            legal_case=legalCase,
            is_approved=isApproved,
            language=language,
        )
        return {"contract_data": contract_data, "agreement_doc": agreementDoc}
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())


@router.post("/contract-create", response_model=ContractStandardResponse)
def create_contract(
    parsed: dict = Depends(parse_contract_create), db: Session = Depends(get_db)
):
    contract = create_contract_for_user(
        db, parsed["contract_data"], parsed["agreement_doc"]
    )
    return {
        "success": True,
        "message": "Contract successfully created, need approval by manager or landlord",
        "data": contract,
    }


@router.post("/approve", summary="Approve a contract and occupy a unit")
def approve_contract(data: ContractApprovalIn, db: Session = Depends(get_db)):
    return approve_contract_unit(
        db=db,
        user_id=data.user_id,
        property_unit_id=data.property_unit_id,
        is_approved=data.is_approved,
    )


@router.get("/approved-list/{landlord_id}", response_model=PaginatedContractList)
def get_approved_contracts(
    landlord_id: UUID = Path(...),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, le=100),
    search: Optional[str] = None,
):
    return list_contracts_by_landlord(
        db,
        landlord_id=landlord_id,
        is_approved=True,
        page=page,
        size=size,
        search=search,
    )


@router.get("/pending-list/{landlord_id}", response_model=PaginatedContractList)
def get_pending_contracts(
    landlord_id: UUID = Path(...),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, le=100),
    search: Optional[str] = None,
):
    return list_contracts_by_landlord(
        db,
        landlord_id=landlord_id,
        is_approved=False,
        page=page,
        size=size,
        search=search,
    )

@router.get("/by-landlord/{landlord_id}")
def get_contracts_by_landlord(
    landlord_id: UUID = Path(...),
    db: Session = Depends(get_db),
):
    return select_list_contracts_by_landlord(db, landlord_id)