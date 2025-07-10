from fastapi import HTTPException, status, Request, UploadFile
from sqlalchemy.orm import Session, joinedload, load_only
from app.models.users import User
from app.models.roles import Role, RolePermission
from app.models.managers import Manager
from app.models.property_units import PropertyUnit
from typing import Optional, List

# import uuid
import uuid
from uuid import UUID

# from app.utils.s3_uploader import upload_file_to_s3
from app.utils.uploader import is_upload_file, save_uploaded_file
from sqlalchemy import or_
from app.modules.securityLogs.services import log_security_event
from app.modules.securityLogs.schemas import SecurityLogCreate
from app.modules.users.schemas import (
    UserCreate,
    UserUpdate,
    UserLogin,
    UserOut,
    UserLoggedInOut,
    UserLOV,
    TokenSchema,
    PaginatedTenantUserResponse,
)
from app.utils.bcrypt import hash_password, verify_password
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)


def authenticate_user(db: Session, login_data: UserLogin, request: Request):
    user = (
        db.query(User)
        .options(
            joinedload(User.role)
            .joinedload(Role.role_permissions)
            .joinedload(RolePermission.permission)
        )
        .filter(or_(User.email == login_data.email, User.phone == login_data.email))
        .first()
    )

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account is currently deactivated. Please contact super admin.",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Log the security event
    log_data = SecurityLogCreate(
        action="login",
        description="User login successful",
        ip_address=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "unknown"),
    )
    log_security_event(db, user_id=user.id, log_data=log_data)
    user_out = UserLoggedInOut.model_validate(user)
    user_out.access_token = access_token
    user_out.refresh_token = refresh_token
    user_out_dict = user_out.model_dump(by_alias=True)

    # user_out_dict["roleName"] = user.role.name if user.role else None
    if user.role:
        role_data = {
            "id": str(user.role.id),
            "name": user.role.name,
            "permissions": [
                {
                    "id": str(rp.permission.id),
                    "name": rp.permission.name,
                    "action": rp.permission.action,
                    "show_on_menu": rp.permission.show_on_menu,
                }
                for rp in user.role.role_permissions
                if rp.is_active and rp.permission and rp.permission.is_active
                # for p in user.role.permissions
            ],
        }
        user_out_dict["role"] = role_data

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


def create_user(db: Session, landlord_data: UserCreate, profile_pic: UploadFile = None):

    print("Creating user with data:", landlord_data, profile_pic)

    allowed_roles = ["User", "Manager"]

    if landlord_data.role_type:
        role = db.query(Role).filter(Role.name == landlord_data.role_type).first()
        if not role:
            raise HTTPException(status_code=400, detail="Role is invalid")

    if role.name not in allowed_roles:
        raise HTTPException(
            status_code=400, detail="Only 'User' and 'Manager' roles are allowed."
        )

    hashed_pwd = hash_password(landlord_data.password)

    try:
        profile_pic_url = None
        if is_upload_file(profile_pic):
            profile_pic_url = save_uploaded_file(
                profile_pic, upload_dir="uploads/profile_pics"
            )
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")

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
        profile_pic=profile_pic_url,
    )
    db.add(user)
    db.flush()
    db.commit()
    db.refresh(user)

    user_data = {
        "id": str(user.id),
        "fname": user.fname,
        "lname": user.lname,
        "email": user.email,
        "phone": user.phone,
        "gender": user.gender,
        "isLandlord": False,
        "createdAt": user.created_at,
        "updatedAt": user.updated_at,
        "is_verified": user.is_verified,
        "is_active": user.is_active,
        "landlord_id": str(user.landlord_id),
        "role_id": str(user.role_id),
        "role_name": user.role.name,
    }

    # return user
    return {
        "success": True,
        "message": "User created successfully",
        "items": UserOut.model_validate(user_data),
    }


def update_user(
    db: Session,
    user_id: UUID,
    update_data: UserUpdate,
    profile_pic: UploadFile = None,
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    for field, value in update_data.model_dump(exclude_unset=True).items():
        if field == "password":
            if value:  # Only update if password is non-empty
                setattr(user, field, hash_password(value))
            else:
                continue  # Skip updating if password is None or empty
        else:
            setattr(user, field, value)

    # Handle profile picture upload
    try:
        if is_upload_file(profile_pic):
            profile_pic_url = save_uploaded_file(
                profile_pic, upload_dir="uploads/profile_pics"
            )
            user.profile_pic = profile_pic_url
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to save profile picture: {str(e)}"
        )

    db.commit()
    db.refresh(user)

    user_data = {
        "id": str(user.id),
        "fname": user.fname,
        "lname": user.lname,
        "email": user.email,
        "phone": user.phone,
        "gender": user.gender,
        "isLandlord": False,
        "createdAt": user.created_at,
        "updatedAt": user.updated_at,
        "is_verified": user.is_verified,
        "is_active": user.is_active,
        "landlord_id": str(user.landlord_id),
        "role_id": str(user.role_id),
        "role_name": user.role.name,
    }

    return {
        "success": True,
        "message": "User updated successfully",
        "items": UserOut.model_validate(user_data),
    }


def delete_user(db: Session, user_id: UUID):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User is already inactive")

    user.is_active = False
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "User deactivated successfully",
        "items": UserOut.model_validate(user),
    }


def get_assigned_units_managers(
    db: Session,
    landlord_id: UUID,
    role_name: str,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
):
    query = (
        db.query(User)
        .join(Role)
        .options(joinedload(User.role))
        .filter(
            User.is_active == True,
            User.is_landlord == False,
            User.landlord_id == landlord_id,
            Role.name == role_name,
        )
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

    seen_ids = set()
    result = []

    for u in users:
        if u.id in seen_ids:
            continue
        seen_ids.add(u.id)

        user_dict = UserOut.model_validate(u).model_dump(by_alias=True)
        user_dict["createdAt"] = u.created_at.isoformat() if u.created_at else None
        user_dict["updatedAt"] = u.updated_at.isoformat() if u.updated_at else None
        user_dict["roleId"] = str(u.role_id)
        user_dict["roleName"] = u.role.name if u.role else None

        # ✅ Assigned units for manager
        if role_name == "Manager":
            assigned_units = (
                db.query(PropertyUnit.id, PropertyUnit.name)
                .join(Manager, Manager.assign_property_unit == PropertyUnit.id)
                .filter(
                    Manager.manager_user_id == u.id,
                    Manager.is_active == True,
                )
                .all()
            )

            user_dict["assignedUnits"] = [
                {
                    "id": str(unit.id),
                    "name": unit.name,
                }
                for unit in assigned_units
            ]

        # Optional: keep this for regular users
        elif role_name == "User":
            assigned_manager = (
                db.query(User)
                .join(Manager, Manager.manager_user_id == User.id)
                .filter(Manager.assign_user == u.id, Manager.is_active == True)
                .first()
            )
            user_dict["assignedManager"] = (
                {
                    "id": str(assigned_manager.id),
                    "name": f"{assigned_manager.fname} {assigned_manager.lname}",
                    "profilePic": assigned_manager.profile_pic,
                }
                if assigned_manager
                else None
            )

        result.append(user_dict)

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": result,
    }


# def get_users_by_role(
#     db: Session,
#     user_id: UUID,
#     page: int = 1,
#     size: int = 10,
#     search: Optional[str] = None,
# ):
#     current_user = (
#         db.query(User)
#         .options(joinedload(User.role))
#         .filter(User.id == user_id, User.is_active == True)
#         .first()
#     )

#     if not current_user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
#         )

#     # Get landlord_id based on user role
#     landlord_id_to_use = None

#     if current_user.is_landlord:
#         # Landlord themselves — use their landlord_id
#         landlord_id_to_use = current_user.landlord_id

#     elif current_user.role.name.lower() != "user":
#         # Manager or custom role — fetch assigned user ids
#         assigned_users_subquery = (
#             db.query(Manager.assign_user)
#             .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
#             .subquery()
#         )

#         query = (
#             db.query(User)
#             .join(Role, User.role_id == Role.id)
#             .options(joinedload(User.role))
#             .filter(
#                 User.id.in_(assigned_users_subquery),
#                 User.is_active == True,
#                 User.is_landlord == False,
#                 Role.name == "User",
#             )
#         )

#     else:
#         # Regular user — get landlord_id and filter accordingly
#         landlord_id_to_use = current_user.landlord_id

#     # Default query for landlords or users with landlord_id
#     if landlord_id_to_use:
#         query = (
#             db.query(User)
#             .join(Role, User.role_id == Role.id)
#             .options(joinedload(User.role))
#             .filter(
#                 User.is_active == True,
#                 User.landlord_id == landlord_id_to_use,
#                 User.is_landlord == False,
#                 Role.name == "User",
#             )
#         )

#     # Apply search filter
#     if search:
#         search_term = f"%{search.strip()}%"
#         query = query.filter(
#             or_(
#                 User.fname.ilike(search_term),
#                 User.lname.ilike(search_term),
#                 User.email.ilike(search_term),
#             )
#         )

#     total = query.count()
#     users = query.offset((page - 1) * size).limit(size).all()

#     seen_ids = set()
#     result = []

#     for u in users:
#         if u.id in seen_ids:
#             continue
#         seen_ids.add(u.id)

#         user_dict = UserOut.model_validate(u).model_dump(by_alias=True)
#         user_dict["createdAt"] = u.created_at.isoformat() if u.created_at else None
#         user_dict["updatedAt"] = u.updated_at.isoformat() if u.updated_at else None
#         user_dict["roleId"] = str(u.role_id)
#         user_dict["roleName"] = u.role.name if u.role else None

#         result.append(user_dict)

#     return {
#         "success": True,
#         "total": total,
#         "page": page,
#         "size": size,
#         "items": result,
#     }


def get_users_by_landlord(
    db: Session,
    landlord_id: UUID,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
):
    query = (
        db.query(User)
        .join(Role, User.role_id == Role.id)
        .options(joinedload(User.role))
        .filter(
            User.is_active == True,
            User.landlord_id == landlord_id,
            User.is_landlord == False,
            Role.name == "User",
        )
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
    for u in users:
        user_dict = UserOut.model_validate(u).model_dump(by_alias=True)
        user_dict["createdAt"] = u.created_at.isoformat() if u.created_at else None
        user_dict["updatedAt"] = u.updated_at.isoformat() if u.updated_at else None
        user_dict["roleId"] = str(u.role_id)
        user_dict["roleName"] = u.role.name if u.role else None
        result.append(user_dict)

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": result,
    }


def get_users_lov_by_landlord(landlord_id: UUID, db: Session) -> List[UserLOV]:
    users = (
        db.query(User.id, User.fname, User.lname)
        .join(Role, User.role_id == Role.id)
        .filter(
            User.landlord_id == landlord_id,
            User.is_active == True,
            User.is_landlord == False,
            Role.name == "User",
        )
        .all()
    )
    return [UserLOV(id=user.id, name=f"{user.fname} {user.lname}") for user in users]


# def get_tenant_users_service(
#     db: Session, page: int = 1, limit: int = 10, search: Optional[str] = None
# ):
#     skip = (page - 1) * limit

#     user_role = db.query(Role).filter(Role.name == "User").first()
#     if not user_role:
#         return PaginatedTenantUserResponse(
#             success=True, total=0, page=page, size=limit, items=[]
#         )

#     # Base query
#     query = db.query(User).filter(User.role_id == user_role.id)

#     if search:
#         query = query.filter(
#             or_(
#                 User.fname.ilike(f"%{search}%"),
#                 User.lname.ilike(f"%{search}%"),
#                 User.email.ilike(f"%{search}%"),
#                 User.phone.ilike(f"%{search}%"),
#             )
#         )

#     total = query.count()
#     items = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

#     return PaginatedTenantUserResponse(
#         success=True,
#         total=total,
#         page=page,
#         size=limit,
#         items=items,
#     )


def get_all_active_users_service(
    db: Session, page: int = 1, limit: int = 10, search: Optional[str] = None
):
    skip = (page - 1) * limit

    query = db.query(User).options(joinedload(User.role))

    if search:
        query = query.filter(
            or_(
                User.fname.ilike(f"%{search}%"),
                User.lname.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.phone.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    # Prepare output with roleName
    items = []
    for user in users:
        user_data = user.to_dict() if hasattr(user, "to_dict") else user.__dict__.copy()
        user_data["roleName"] = user.role.name if user.role else None
        items.append(user_data)

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": limit,
        "items": items,
    }
