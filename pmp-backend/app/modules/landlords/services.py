from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional
from uuid import UUID
from app.models.landlords import Landlord
from app.models.users import User
from app.models.roles import Role
from app.modules.landlords.schemas import (
    LandlordCreate,
    LandlordOut,
    VerifyLandlordRequest,
    LandlordUpdate,
)
from app.utils.bcrypt import hash_password, verify_password
import uuid

# from fastapi import HTTPException, status


def create_landlord(db: Session, landlord_data: LandlordCreate):

    try:
        role = db.query(Role).filter(Role.name == "Landlord").first()
        if not role:
            raise ValueError("Role 'Landlord' not found in roles table.")

        hashed_pwd = hash_password(landlord_data.password)

        landlord = Landlord(id=uuid.uuid4())
        db.add(landlord)
        db.flush()

        user = User(
            id=uuid.uuid4(),
            role_id=role.id,
            landlord_id=landlord.id,
            is_landlord=True,
            fname=landlord_data.fname,
            lname=landlord_data.lname,
            email=landlord_data.email,
            password=hashed_pwd,
            phone=landlord_data.phone,
            gender=landlord_data.gender,
            is_verified=landlord_data.is_verified,
        )
        db.add(user)
        db.flush()

        db.commit()
        db.refresh(user)

        return {
            "success": True,
            "message": "Landlord created successfully.",
            "items": user,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create landlord: {str(e)}"
        )


def update_landlord(db: Session, landlord_id: UUID, data: LandlordUpdate):
    user = (
        db.query(User)
        .filter(User.landlord_id == landlord_id, User.is_landlord == True)
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="Landlord user not found")

    try:
        if data.fname:
            user.fname = data.fname
        if data.lname:
            user.lname = data.lname
        if data.email:
            user.email = data.email
        if data.phone:
            user.phone = data.phone
        if data.gender:
            user.gender = data.gender
        if data.password:
            user.password = hash_password(data.password)
        if data.role_id:
            user.role_id = data.role_id

        db.commit()
        db.refresh(user)

        return {
            "success": True,
            "message": "Landlord updated successfully.",
            "items": user,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def get_verified_landlords(
    db: Session, page: int = 1, size: int = 10, search: Optional[str] = None
):
    query = (
        db.query(User)
        .where(User.is_active == True, User.is_verified == True)
        .outerjoin(Landlord, User.landlord_id == Landlord.id)
        .options(joinedload(User.landlord))
        .filter(User.is_active == True, User.is_landlord == True)
    )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.fname.ilike(search_term),
                User.lname.ilike(search_term),
                User.email.ilike(search_term),
            )
        )

    total = query.count()

    landlords = query.offset((page - 1) * size).limit(size).all()

    result = []
    for l in landlords:
        landlord_dict = LandlordOut.model_validate(l).model_dump(by_alias=True)
        landlord_dict["createdAt"] = l.created_at.isoformat() if l.created_at else None
        landlord_dict["updatedAt"] = l.updated_at.isoformat() if l.updated_at else None
        result.append(landlord_dict)

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": result,
    }


def get_unverified_landlords(
    db: Session, page: int = 1, size: int = 10, search: Optional[str] = None
):
    query = (
        db.query(User)
        .where(User.is_active == True, User.is_verified == False)
        .outerjoin(Landlord, User.landlord_id == Landlord.id)
        .options(joinedload(User.landlord))
        .filter(User.is_active == True, User.is_landlord == True)
    )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.fname.ilike(search_term),
                User.lname.ilike(search_term),
                User.email.ilike(search_term),
            )
        )

    total = query.count()

    landlords = query.offset((page - 1) * size).limit(size).all()

    result = []
    for l in landlords:
        landlord_dict = LandlordOut.model_validate(l).model_dump(by_alias=True)
        landlord_dict["createdAt"] = l.created_at.isoformat() if l.created_at else None
        landlord_dict["updatedAt"] = l.updated_at.isoformat() if l.updated_at else None
        result.append(landlord_dict)

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": result,
    }


def verify_landlord_service(data: VerifyLandlordRequest, db: Session):
    user = (
        db.query(User).filter(User.id == data.user_id, User.is_landlord == True).first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or is not a landlord",
        )

    if data.is_verified:
        user.is_verified = True
    else:
        user.is_active = False

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Landlord verification status updated successfully.",
    }


def delete_landlord_user(db: Session, landlord_user_id: UUID):
    user = (
        db.query(User)
        .filter(User.id == landlord_user_id, User.is_landlord == True)
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="Landlord user not found")

    user.is_active = False
    db.commit()

    return {"success": True, "message": "Landlord user deactivated successfully."}
