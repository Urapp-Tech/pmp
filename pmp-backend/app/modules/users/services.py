from fastapi import HTTPException, status, Request, UploadFile
from sqlalchemy.orm import Session, joinedload, load_only
from app.models.users import User
from app.models.roles import Role, RolePermission
from app.models.managers import Manager
from typing import Optional, List

# import uuid
from uuid import UUID
from app.utils.s3_uploader import upload_file_to_s3
from sqlalchemy import or_
from app.modules.securityLogs.services import log_security_event
from app.modules.securityLogs.schemas import SecurityLogCreate
from app.modules.users.schemas import (
    UserCreate,
    UserLogin,
    UserOut,
    UserLoggedInOut,
    UserLOV,
    TokenSchema,
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
            .joinedload(RolePermission.permission_obj)
        )
        .filter(User.email == login_data.email)
        .first()
    )

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
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
                    "id": str(rp.permission_obj.id),
                    "name": rp.permission_obj.name,
                    "action": rp.permission_obj.action,
                    "show_on_menu": rp.permission_obj.show_on_menu,
                }
                for rp in user.role.role_permissions
                if rp.is_active and rp.permission_obj and rp.permission_obj.is_active
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

    print("Creating user with data:", landlord_data)

    allowed_roles = ["User", "Manager"]

    role = db.query(Role).filter(Role.id == landlord_data.role_id).first()
    if not role:
        raise ValueError("Provided role_id is invalid.")

    if role.name not in allowed_roles:
        raise ValueError("Only 'User' and 'Manager' roles are allowed.")

    hashed_pwd = hash_password(landlord_data.password)

    profile_pic_url = None
    if profile_pic:
        profile_pic_url = upload_file_to_s3(profile_pic, folder="profile_pics")

    user = User(
        id=UUID,
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

    # return user
    return {
        "success": True,
        "message": "User created successfully",
        "items": user,
    }


# def get_users(db: Session, page: int = 1, size: int = 10, search: Optional[str] = None):
#     query = (
#         db.query(User)
#         .options(joinedload(User.role))
#         .where(User.is_active == True, User.is_landlord == False)
#     )
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

#     result = []
#     for l in users:
#         user_dict = UserOut.model_validate(l).model_dump(by_alias=True)
#         user_dict["createdAt"] = l.created_at.isoformat() if l.created_at else None
#         user_dict["updatedAt"] = l.updated_at.isoformat() if l.updated_at else None
#         user_dict["roleId"] = str(l.role_id)
#         user_dict["roleName"] = l.role.name if l.role else None
#         result.append(user_dict)

#     return {
#         "success": True,
#         "total": total,
#         "page": page,
#         "size": size,
#         "items": result,
#     }


def get_manager_users_by_role(
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

        # Extra field only for manager list
        if role_name == "Manager":
            assigned_users = (
                db.query(User)
                .join(Manager, Manager.assign_user == User.id)
                .filter(Manager.manager_user_id == u.id, Manager.is_active == True)
                .options(load_only(User.id, User.fname, User.lname, User.profile_pic))
                .all()
            )

            user_dict["assignedUsers"] = [
                {
                    "id": str(au.id),
                    "name": f"{au.fname} {au.lname}",
                    "profilePic": au.profile_pic,
                }
                for au in assigned_users
            ]

        # Extra field only for user list
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
#         return {
#             "success": False,
#             "total": 0,
#             "page": page,
#             "size": size,
#             "items": [],
#         }

#     user_role_name = current_user.role.name if current_user.role else None

#     # Determine query base
#     if current_user.is_landlord:
#         landlord_id = current_user.id
#         query = (
#             db.query(User)
#             .join(Role)
#             .options(joinedload(User.role))
#             .filter(
#                 User.is_active == True,
#                 User.is_landlord == False,
#                 User.landlord_id == landlord_id,
#                 Role.name == "User",
#             )
#         )
#     elif user_role_name and user_role_name != "User":
#         assigned_user_ids = (
#             db.query(Manager.assign_user)
#             .filter(
#                 Manager.manager_user_id == user_id,
#                 Manager.is_active == True,
#             )
#             .all()
#         )
#         assigned_user_ids = [au.assign_user for au in assigned_user_ids]
#         if not assigned_user_ids:
#             return {
#                 "success": True,
#                 "total": 0,
#                 "page": page,
#                 "size": size,
#                 "items": [],
#             }

#         query = (
#             db.query(User)
#             .join(Role)
#             .options(joinedload(User.role))
#             .filter(
#                 User.id.in_(assigned_user_ids),
#                 User.is_active == True,
#                 Role.name == "User",
#             )
#         )
#     else:
#         # Fallback: no access
#         return {
#             "success": False,
#             "message": "Unauthorized role",
#             "total": 0,
#             "page": page,
#             "size": size,
#             "items": [],
#         }

#     # Search filter
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

#         # Also include assignedManager for user entries
#         assigned_manager = (
#             db.query(User)
#             .join(Manager, Manager.manager_user_id == User.id)
#             .filter(Manager.assign_user == u.id, Manager.is_active == True)
#             .first()
#         )
#         user_dict["assignedManager"] = (
#             {
#                 "id": str(assigned_manager.id),
#                 "name": f"{assigned_manager.fname} {assigned_manager.lname}",
#                 "profilePic": assigned_manager.profile_pic,
#             }
#             if assigned_manager
#             else None
#         )

#         result.append(user_dict)

#     return {
#         "success": True,
#         "total": total,
#         "page": page,
#         "size": size,
#         "items": result,
#     }


def get_users_by_role(
    db: Session,
    user_id: UUID,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
):
    current_user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.id == user_id, User.is_active == True)
        .first()
    )

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get landlord_id based on user role
    landlord_id_to_use = None

    if current_user.is_landlord:
        # Landlord themselves — use their landlord_id
        landlord_id_to_use = current_user.landlord_id

    elif current_user.role.name.lower() != "user":
        # Manager or custom role — fetch assigned user ids
        assigned_users_subquery = (
            db.query(Manager.assign_user)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .subquery()
        )

        query = (
            db.query(User)
            .join(Role, User.role_id == Role.id)
            .options(joinedload(User.role))
            .filter(
                User.id.in_(assigned_users_subquery),
                User.is_active == True,
                User.is_landlord == False,
                Role.name == "User",
            )
        )

    else:
        # Regular user — get landlord_id and filter accordingly
        landlord_id_to_use = current_user.landlord_id

    # Default query for landlords or users with landlord_id
    if landlord_id_to_use:
        query = (
            db.query(User)
            .join(Role, User.role_id == Role.id)
            .options(joinedload(User.role))
            .filter(
                User.is_active == True,
                User.landlord_id == landlord_id_to_use,
                User.is_landlord == False,
                Role.name == "User",
            )
        )

    # Apply search filter
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

        # Assigned Manager
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
