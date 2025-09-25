from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from app.modules.contact.schemas import (
    ContactUsCreate, ContactUsCreateResponse, ContactUsListResponse
)
from app.modules.contact.services import (
    create_contact_us, delete_contact_us, get_contact_us
)
from app.db.database import get_db

router = APIRouter()


@router.post("/contact")
def create_contact(contact: ContactUsCreate, db: Session = Depends(get_db)):
    return create_contact_us(db, contact)

@router.get("/contacts", response_model=ContactUsListResponse)
def get_contact(db: Session = Depends(get_db), page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None)):
    return get_contact_us(db, page=page, size=size, search=search)

@router.post("/contact/delete/{id}")
def delete_contact(id: UUID, db: Session = Depends(get_db)):
    return delete_contact_us(db, id)
     
