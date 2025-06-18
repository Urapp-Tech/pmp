from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.roles import Role
from typing import Optional
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from app.modules.users.schemas import (
    UserCreate,
    UserLogin,
    UserOut,
    UserLoggedInOut,
    # LoginResponse,
    TokenSchema,
)
import uuid
from app.utils.bcrypt import hash_password, verify_password
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)

# def create_user(db: Session, user: UserCreate):
#     hashed_password = hash_password(user.password)
#     db_user = User(
#         name=user.name,
#         email=user.email,
#         password=hashed_password,
#         phone=user.phone,
#         gender=user.gender,
#     )
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return db_user


def create_user(db: Session, landlord_data: UserCreate):

    print("Creating user with data:", landlord_data)

    allowed_roles = ["User", "Manager"]

    role = db.query(Role).filter(Role.id == landlord_data.role_id).first()
    if not role:
        raise ValueError("Provided role_id is invalid.")

    if role.name not in allowed_roles:
        raise ValueError("Only 'User' and 'Manager' roles are allowed.")

    hashed_pwd = hash_password(landlord_data.password)

    user = User(
        id=uuid.uuid4(),
        fname=landlord_data.fname,
        lname=landlord_data.lname,
        email=landlord_data.email,
        phone=landlord_data.phone,
        password=hashed_pwd,
        gender=landlord_data.gender,
        role_id=role.id,
        landlord_id=landlord_data.landlord_id,
        is_landlord=False,
    )
    db.add(user)
    db.flush()
    db.commit()
    db.refresh(user)

    return user


# def get_users(db: Session):
#     return db.query(User).all()


def get_users(db: Session, page: int = 1, size: int = 10, search: Optional[str] = None):
    query = (
        db.query(User)
        .options(joinedload(User.role))
        .where(User.is_active == True, User.is_landlord == False)
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

    users = query.offset((page - 1) * size).limit(size).all()

    result = []
    for l in users:
        user_dict = UserOut.model_validate(l).model_dump(by_alias=True)
        user_dict["createdAt"] = l.created_at.isoformat() if l.created_at else None
        user_dict["updatedAt"] = l.updated_at.isoformat() if l.updated_at else None
        user_dict["roleId"] = str(l.role_id)
        user_dict["roleName"] = l.role.name if l.role else None
        result.append(user_dict)

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": result,
    }


def authenticate_user(db: Session, login_data: UserLogin):
    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.email == login_data.email)
        .first()
    )

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    user_out = UserLoggedInOut.model_validate(user)
    user_out.access_token = access_token
    user_out.refresh_token = refresh_token

    user_out_dict = user_out.model_dump(by_alias=True)
    user_out_dict["roleName"] = user.role.name if user.role else None

    return {
        "data": user_out_dict,
        "success": True,
        "message": "User logged in successfully",
        "token_type": "bearer",
    }


def refresh_access_token(refresh_token: str) -> TokenSchema:
    payload = verify_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    user_data = {"sub": payload["sub"]}
    access_token = create_access_token(user_data)
    new_refresh_token = refresh_token
    return TokenSchema(access_token=access_token, refresh_token=new_refresh_token)
