from fastapi import HTTPException, status, Request, UploadFile
from sqlalchemy import func
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload, load_only
from app.models.users import User
from app.models.properties import Property
from app.models.tenants import Tenant
from app.models.users import User
from app.models.roles import Role, RolePermission
from app.models.managers import Manager
from app.models.property_units import PropertyUnit
from app.models.payment_history import PaymentHistory
from typing import Dict, Any, Optional, List, Tuple
from math import ceil
from collections import defaultdict
from sqlalchemy.exc import IntegrityError

# import uuid
import uuid
from uuid import UUID

# from app.utils.s3_uploader import upload_file_to_s3
from app.utils.uploader import is_upload_file, save_uploaded_file
from sqlalchemy import or_
from app.modules.securityLogs.services import log_security_event
from app.modules.securityLogs.schemas import SecurityLogCreate
from app.models.subscribed_landlord import SubscribedLandlord
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
from app.utils.email_service import render_template, send_email

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

    # Security log
    log_data = SecurityLogCreate(
        action="login",
        description="User login successful",
        ip_address=request.client.host if request and request.client else "unknown",
        user_agent=(
            request.headers.get("user-agent", "unknown") if request else "unknown"
        ),
    )
    log_security_event(db, user_id=user.id, log_data=log_data)

    user_out = UserLoggedInOut.model_validate(user)
    user_out.access_token = access_token
    user_out.refresh_token = refresh_token
    user_out_dict = user_out.model_dump(by_alias=True)

    # Attach role + permissions
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
            ],
        }
        user_out_dict["role"] = role_data

    # ----- Allowed holding properties (sum only PAID/SUCCESS) -----
    allowed_holding = 0
    if getattr(user, "is_landlord", False) and getattr(user, "landlord_id", None):
        # all approved subscription records for this landlord
        subs = (
            db.query(SubscribedLandlord)
            .filter(
                SubscribedLandlord.landlord_id == user.landlord_id,
                SubscribedLandlord.status == "approved",
            )
            .all()
        )

        for rec in subs:
            # Find the latest subscription payment row for this plan.
            # We check BOTH keys:
            #  - subscribed_landlords.id  (some flows save this)
            #  - subscriptions.id         (your current flow saves this)
            latest_ph = (
                db.query(PaymentHistory)
                .filter(
                    PaymentHistory.payment_type == "SUBSCRIPTION",
                    or_(
                        PaymentHistory.subscription_id == rec.id,
                        PaymentHistory.subscription_id == rec.subscription_id,
                    ),
                )
                .order_by(PaymentHistory.created_at.desc())
                .first()
            )

            status_val = (
                str(latest_ph.status).upper() if latest_ph and latest_ph.status else ""
            )
            if status_val in ("PAID", "SUCCESS"):
                allowed_holding += int(rec.holding_properties or 0)

    # Expose a single integer for the FE
    user_out_dict["allowedHoldingProperties"] = allowed_holding

    # Do NOT return subscription object anymore
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

    # Resolve & validate role
    role = None
    if landlord_data.role_type:
        role = db.query(Role).filter(Role.name == landlord_data.role_type).first()
        if not role:
            raise HTTPException(status_code=400, detail="Role is invalid")
    if role is None or role.name not in allowed_roles:
        raise HTTPException(
            status_code=400, detail="Only 'User' and 'Manager' roles are allowed."
        )

    # Normalize email
    incoming_email = (landlord_data.email or "").strip().lower()
    if not incoming_email:
        raise HTTPException(status_code=400, detail="Email is required")

    # Ensure landlord_id is present for non-landlord users
    if not landlord_data.landlord_id:
        raise HTTPException(status_code=400, detail="landlord_id is required")

    # Same-landlord duplicate check (case-insensitive)
    existing_same_landlord = (
        db.query(User)
        .filter(
            User.landlord_id == landlord_data.landlord_id,
            func.lower(User.email) == incoming_email,
        )
        .first()
    )
    if existing_same_landlord:
        # This is your "wrong example": duplicate under same landlord
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists for the selected landlord.",
        )

    hashed_pwd = hash_password(landlord_data.password)

    # Optional: handle profile pic
    profile_pic_url = None
    try:
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
        email=incoming_email,  # store normalized
        phone=landlord_data.phone,
        password=hashed_pwd,
        gender=landlord_data.gender,
        role_id=role.id,
        landlord_id=landlord_data.landlord_id,
        is_landlord=False,
        profile_pic=profile_pic_url,
    )

    db.add(user)
    try:
        db.flush()  # write to DB
        db.commit()
    except IntegrityError as ie:
        db.rollback()
        # Until you run the migration below, a duplicate email *anywhere* will raise here
        msg = "Email already exists."
        # If the driver exposes constraint name, customize message:
        if (
            hasattr(ie.orig, "diag")
            and getattr(ie.orig.diag, "constraint_name", "") == "users_email_key"
        ):
            msg = "Email already exists (global uniqueness). Update DB to unique per landlord."
        raise HTTPException(status_code=409, detail=msg)

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
                db.query(PropertyUnit.id, PropertyUnit.name, PropertyUnit.unit_no)
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
                    "unit_no": unit.unit_no,
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


def get_users_by_landlord(
    db: Session,
    landlord_id: UUID,
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
):
    # Step 1: Get all approved rentals
    tenant_data = (
        db.query(
            Tenant.user_id,
            Property.name.label("property_name"),
            PropertyUnit.name.label("unit_name"),
        )
        .join(PropertyUnit, Tenant.property_unit_id == PropertyUnit.id)
        .join(Property, PropertyUnit.property_id == Property.id)
        .filter(Tenant.is_approved == True)
        .all()
    )

    # Step 2: Group property/unit names by user_id
    rental_map = defaultdict(lambda: {"properties": set(), "units": set()})
    for t in tenant_data:
        rental_map[t.user_id]["properties"].add(t.property_name)
        rental_map[t.user_id]["units"].add(t.unit_name)

    # Step 3: Build user query
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

    # Step 4: Optional search (on User + property/unit names)
    if search:
        search_term = f"%{search.strip()}%"
        matched_user_ids = set()
        for user_id, data in rental_map.items():
            if any(
                search.strip().lower() in (name or "").lower()
                for name in data["properties"].union(data["units"])
            ):
                matched_user_ids.add(user_id)

        query = query.filter(
            or_(
                User.fname.ilike(search_term),
                User.lname.ilike(search_term),
                User.email.ilike(search_term),
                User.id.in_(matched_user_ids),
            )
        )

    # Step 5: Pagination and final fetch
    total = query.count()
    users = query.offset((page - 1) * size).limit(size).all()

    # Step 6: Format final output
    result = []
    for u in users:
        user_dict = UserOut.model_validate(u).model_dump(by_alias=True)
        user_dict["createdAt"] = u.created_at.isoformat() if u.created_at else None
        user_dict["updatedAt"] = u.updated_at.isoformat() if u.updated_at else None
        user_dict["roleId"] = str(u.role_id)
        user_dict["roleName"] = u.role.name if u.role else None

        rentals = rental_map.get(u.id, {"properties": set(), "units": set()})
        user_dict["assignedProperty"] = list(rentals["properties"])
        user_dict["assignedPropertyUnit"] = list(rentals["units"])

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
    db: Session,
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    role_filter: Optional[str] = None,
):
    skip = (page - 1) * limit
    query = db.query(User).options(joinedload(User.role))

    # Search filter
    if search:
        query = query.filter(
            or_(
                User.fname.ilike(f"%{search}%"),
                User.lname.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.phone.ilike(f"%{search}%"),
            )
        )

    # Role filter (exclude 'All')
    if role_filter and role_filter.lower() != "all":
        query = query.join(User.role).filter(Role.name.ilike(role_filter))

    total = query.count()

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    items = []

    for user in users:
        user_data = {
            "id": str(user.id),
            "fname": user.fname,
            "lname": user.lname,
            "email": user.email,
            "phone": user.phone,
            "isLandlord": user.is_landlord,
            "landlordId": str(user.landlord_id) if user.landlord_id else None,
            "roleId": str(user.role_id) if user.role_id else None,
            "roleName": user.role.name if user.role else None,
            "profilePic": user.profile_pic,
            "gender": user.gender,
            "isActive": user.is_active,
            "isVerified": user.is_verified,
            "createdAt": user.created_at.isoformat(),
            "updatedAt": user.updated_at.isoformat(),
            "userProperty": None,
            "userPropertyUnit": None,
        }

        user_data["assignedProperty"] = []
        user_data["assignedPropertyUnit"] = []

        # Only for users with role "user"
        if user_data.get("roleName", "").lower() == "user":
            tenants = (
                db.query(Tenant)
                .filter(Tenant.user_id == user.id, Tenant.is_approved == True)
                .all()
            )
            for tenant in tenants:
                unit = (
                    db.query(PropertyUnit).filter_by(id=tenant.property_unit_id).first()
                )
                if unit:
                    prop = db.query(Property).filter_by(id=unit.property_id).first()
                    if prop:
                        user_data["assignedProperty"].append(prop.name)
                        user_data["assignedPropertyUnit"].append(unit.name)

        items.append(user_data)

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": limit,
        "items": items,
    }


# landlord user profile


def _tz_aware(dt):
    if not dt:
        return None
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def get_landlord_profile_service(
    db: Session,
    landlord_id: str,
    history_page: int = 1,
    history_size: int = 10,
) -> Dict[str, Any]:
    """
    Returns landlord profile summary + ALL approved subscriptions (array) +
    subscription payment history (with subsName & holdingProperties for each row).
    """

    # ---- 1) Representative landlord user for profile summary ----
    u = (
        db.query(User)
        .filter(User.landlord_id == landlord_id, User.is_landlord == True)
        .order_by(User.created_at.desc())
        .first()
    ) or (
        db.query(User)
        .filter(User.landlord_id == landlord_id)
        .order_by(User.created_at.desc())
        .first()
    )

    name = email = phone = gender = None
    is_verified = None
    created_at = None
    if u:
        name = (
            " ".join(
                [x for x in [(u.fname or "").strip(), (u.lname or "").strip()] if x]
            )
            or None
        )
        email, phone, gender = u.email, u.phone, u.gender
        is_verified, created_at = u.is_verified, u.created_at

    now = datetime.now(timezone.utc)

    # ---- 2) ALL approved subscriptions for this landlord ----
    recs_approved: List[SubscribedLandlord] = (
        db.query(SubscribedLandlord)
        .filter(
            SubscribedLandlord.landlord_id == landlord_id,
            SubscribedLandlord.status.ilike("approved"),
        )
        .order_by(SubscribedLandlord.created_at.desc())
        .all()
    )

    # Build lookups
    subs_by_id = {r.id: r for r in recs_approved}  # subscribed_landlords.id -> record
    plan_ids = [r.subscription_id for r in recs_approved if r.subscription_id]
    latest_rec_by_plan_id = {}
    for r in recs_approved:
        if r.subscription_id and r.subscription_id not in latest_rec_by_plan_id:
            latest_rec_by_plan_id[r.subscription_id] = r  # newest-first order above

    # Prefetch latest PaymentHistory by subscription_id (both SL.id and plan id)
    all_sids = set(subs_by_id.keys()) | set(plan_ids)
    latest_status_by_sid: dict = {}
    if all_sids:
        ph_rows = (
            db.query(
                PaymentHistory.subscription_id,
                PaymentHistory.status,
                PaymentHistory.created_at,
            )
            .filter(
                PaymentHistory.payment_type == "SUBSCRIPTION",
                PaymentHistory.subscription_id.in_(list(all_sids)),
            )
            .order_by(PaymentHistory.created_at.desc())
            .all()
        )
        for sid, st, _created in ph_rows:
            if sid not in latest_status_by_sid:
                latest_status_by_sid[sid] = (str(st or "")).upper()

    # Compose output array
    subscriptions_out: List[Dict[str, Any]] = []
    for rec in recs_approved:
        exp = _tz_aware(rec.expiration_date)
        not_expired = bool(exp and exp > now)

        # latest status from either the subscribed_landlords.id or plan id
        st1 = latest_status_by_sid.get(rec.id)
        st2 = (
            latest_status_by_sid.get(rec.subscription_id)
            if rec.subscription_id
            else None
        )
        latest_status = st1 or st2 or ""
        is_paid = latest_status in ("PAID", "SUCCESS")

        # days to expiry
        days_to_expiry: Optional[int] = None
        if exp:
            delta = exp - now
            days_to_expiry = max(0, int(delta.total_seconds() // 86400))

        # Pay Now rules
        show_pay_now = False
        if rec.payment_link:
            if rec.holding_properties and rec.holding_properties <= 3:
                show_pay_now = (days_to_expiry is not None) and (
                    0 <= days_to_expiry <= 7
                )
            else:
                show_pay_now = True

        subscriptions_out.append(
            {
                "id": rec.id,  # subscribed_landlords.id
                "subscriptionId": rec.subscription_id,  # plans table id
                "planName": rec.plan_name,
                "holdingProperties": rec.holding_properties,
                "expirationDate": exp,
                "daysToExpiry": days_to_expiry,
                "paymentLink": rec.payment_link,
                "status": rec.status,
                "isSubscribed": bool(
                    not_expired and is_paid
                ),  # must be not expired and last payment paid
                "totalAmount": (
                    str(rec.total_amount) if rec.total_amount is not None else None
                ),
                "discountedAmount": (
                    str(rec.discounted_amount)
                    if rec.discounted_amount is not None
                    else None
                ),
                "dueAmount": (
                    str(rec.due_amount) if rec.due_amount is not None else None
                ),
                "createdAt": rec.created_at,
                "updatedAt": rec.updated_at,
            }
        )

    # ---- 3) Payment history (SUBSCRIPTION payments for this landlord) ----
    landlord_user_ids = [
        x.id for x in db.query(User.id).filter(User.landlord_id == landlord_id).all()
    ]

    base_q = db.query(PaymentHistory).filter(
        PaymentHistory.payment_type == "SUBSCRIPTION"
    )
    if all_sids and landlord_user_ids:
        base_q = base_q.filter(
            or_(
                PaymentHistory.subscription_id.in_(list(all_sids)),
                PaymentHistory.user_id.in_(landlord_user_ids),
            )
        )
    elif all_sids:
        base_q = base_q.filter(PaymentHistory.subscription_id.in_(list(all_sids)))
    elif landlord_user_ids:
        base_q = base_q.filter(PaymentHistory.user_id.in_(landlord_user_ids))
    # else: keep it as-is (unlikely, but safe)

    # Accurate count + pagination
    count_sq = base_q.order_by(None).with_entities(PaymentHistory.id).subquery()
    total = db.query(func.count()).select_from(count_sq).scalar() or 0

    history_page = max(1, int(history_page))
    history_size = max(1, min(int(history_size), 200))
    offset = (history_page - 1) * history_size

    rows = (
        base_q.order_by(PaymentHistory.created_at.desc())
        .offset(offset)
        .limit(history_size)
        .all()
    )

    def _resolve_row_meta(r: PaymentHistory) -> Tuple[Optional[str], Optional[int]]:
        """
        Returns (subsName, holdingProperties) for a payment row.
        - If r.subscription_id matches a subscribed_landlords.id -> use that record
        - Else if it matches a plan id -> use the newest approved record for that plan id
        - Else -> (None, None)
        """
        sid = getattr(r, "subscription_id", None)
        if not sid:
            return (None, None)

        rec = subs_by_id.get(sid)
        if rec:
            return (rec.plan_name, rec.holding_properties)

        rec2 = latest_rec_by_plan_id.get(sid)
        if rec2:
            return (rec2.plan_name, rec2.holding_properties)

        return (None, None)

    history_items = []
    for r in rows:
        subs_name, holding_props = _resolve_row_meta(r)
        history_items.append(
            {
                "id": r.id,
                "amount": float(r.amount) if r.amount is not None else 0.0,
                "currency": r.currency,
                "status": str(r.status),
                "paymentUrl": r.payment_url,
                "invoiceId": r.invoice_id,
                "subscriptionId": str(r.subscription_id) if r.subscription_id else None,
                "subsName": subs_name,  # <-- added
                "holdingProperties": holding_props,  # <-- added
                "createdAt": r.created_at,
            }
        )

    return {
        "data": {
            "landlordId": landlord_id,
            "name": name,
            "email": email,
            "phone": phone,
            "gender": gender,
            "isVerified": is_verified,
            "createdAt": created_at,
            "subscriptions": subscriptions_out,  # <-- ARRAY ONLY
            "history": {
                "items": history_items,
                "page": history_page,
                "pageSize": history_size,
                "total": total,
                "totalPages": ceil(total / history_size) if history_size else 0,
                "success": True,
            },
        },
        "success": True,
        "message": "Landlord profile loaded",
    }
