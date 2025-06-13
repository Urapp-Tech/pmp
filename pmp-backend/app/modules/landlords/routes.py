from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.db.database import SessionLocal

# from app.models import User
from app.modules.landlords.schemas import (
    LandlordCreate,
    LandlordOut,
    PaginatedLandlordResponse,
    VerifyLandlordRequest,
)
from app.modules.landlords.services import (
    create_landlord,
    get_verified_landlords,
    get_unverified_landlords,
    verify_landlord_service,
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=LandlordOut, summary="Create a new landlord")
def create(user: LandlordCreate, db: Session = Depends(get_db)):
    return create_landlord(db, user)


# @router.get("/list", response_model=list[LandlordOut])
# def read(db: Session = Depends(get_db)):
#     return get_landlords(db)


@router.get("/list", response_model=PaginatedLandlordResponse)
def read_landlords(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_verified_landlords(db=db, page=page, size=size, search=search)


@router.get("/unverified/list", response_model=PaginatedLandlordResponse)
def read_landlords(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_unverified_landlords(db=db, page=page, size=size, search=search)


@router.post("/verify")
def verify_landlord(data: VerifyLandlordRequest, db: Session = Depends(get_db)):
    return verify_landlord_service(data, db)
