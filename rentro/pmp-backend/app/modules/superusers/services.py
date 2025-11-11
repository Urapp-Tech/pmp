from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from math import ceil
from uuid import UUID
from typing import Optional, List

from app.models.super_admins import SuperAdmin
from app.models.roles import Role
from app.models.permissions import Permission
from app.models.roles import RolePermission
from app.modules.superusers.schemas import (
    SuperAdminCreate,
    SuperAdminUpdate,
    UserLogin,
    UserOut,
    RoleWithPermissionsOut,
    PermissionMiniOut,
)
from app.utils.bcrypt import hash_password, verify_password
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)

# ---------- helpers ----------


def _split_name(full: Optional[str]) -> tuple[str, str]:
    s = (full or "").strip()
    if not s:
        return "", ""
    parts = s.split()
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def _fetch_role(db: Session, role_id: Optional[UUID]) -> Optional[Role]:
    if not role_id:
        return None
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    return role


def _serialize_superadmin(user: SuperAdmin, role: Optional[Role]) -> UserOut:
    fname, lname = _split_name(user.name)
    # roleName: use "Super Admin" when no role (root)
    payload = {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "is_active": user.is_active,
        "name": user.name,
        "fname": fname,
        "lname": lname,
        "role_id": role.id if role else None,
        "role_name": role.name if role else "Super Admin",
        "access_token": None,
        "refresh_token": None,
    }
    return UserOut(**payload)


def _ensure_single_root(db: Session, ignore_id: UUID | None = None):
    """Ensure at most one row with role_id IS NULL (the root super admin)."""
    q = db.query(SuperAdmin).filter(SuperAdmin.role_id.is_(None))
    if ignore_id:
        q = q.filter(SuperAdmin.id != ignore_id)
    exists = db.query(q.exists()).scalar()
    if exists:
        raise HTTPException(
            status_code=400,
            detail="Root Super Admin already exists; assign a role_id for sub-superadmins.",
        )


def _ensure_email_unique(db: Session, email: str, ignore_id: UUID | None = None):
    q = db.query(SuperAdmin).filter(func.lower(SuperAdmin.email) == email.lower())
    if ignore_id:
        q = q.filter(SuperAdmin.id != ignore_id)
    if db.query(q.exists()).scalar():
        raise HTTPException(status_code=400, detail="Email is already in use.")


def _fetch_role(db: Session, role_id: UUID | None) -> Role | None:
    if not role_id:
        return None
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    return role


# ---------- CRUD ----------


def create_superadmin(db: Session, payload: SuperAdminCreate):
    # unique email check (optional if DB unique)
    exists = (
        db.query(SuperAdmin)
        .filter(func.lower(SuperAdmin.email) == payload.email.lower())
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Email is already in use.")

    # resolve role (None => root super admin)
    role = _fetch_role(db, payload.role_id)

    db_user = SuperAdmin(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        phone=payload.phone,
        role_id=payload.role_id,  # None => root
        is_active=bool(payload.is_active),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "items": _serialize_superadmin(db_user, role),
        "success": True,
        "message": "Super user has been created",
    }


def update_superadmin(db: Session, superadmin_id: UUID, payload: SuperAdminUpdate):
    user = db.query(SuperAdmin).filter(SuperAdmin.id == superadmin_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="SuperAdmin not found.")

    if payload.email and payload.email != user.email:
        exists = (
            db.query(SuperAdmin)
            .filter(
                func.lower(SuperAdmin.email) == payload.email.lower(),
                SuperAdmin.id != user.id,
            )
            .first()
        )
        if exists:
            raise HTTPException(status_code=400, detail="Email is already in use.")
        user.email = payload.email

    if payload.name is not None:
        user.name = payload.name
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.is_active is not None:
        user.is_active = bool(payload.is_active)
    if payload.password:
        user.password = hash_password(payload.password)

    # role switch
    role = None
    if "role_id" in payload.__fields_set__:
        role = _fetch_role(db, payload.role_id) if payload.role_id else None
        user.role_id = payload.role_id

    db.add(user)
    db.commit()
    db.refresh(user)

    # if role wasn't touched, still resolve for name (or leave None => Super Admin)
    if role is None:
        role = _fetch_role(db, user.role_id)

    return {
        "items": _serialize_superadmin(user, role),
        "success": True,
        "message": "Super user has been updated",
    }


def list_sub_superadmins(
    db: Session, page: int = 1, page_size: int = 20, q: str | None = None
):
    """
    Return only sub-superadmins (role_id IS NOT NULL), paginated.
    Optional q: case-insensitive search over name/email/phone.
    """
    page = max(1, int(page))
    page_size = max(1, min(int(page_size), 200))

    base_q = db.query(SuperAdmin).filter(SuperAdmin.role_id.isnot(None))

    if q:
        like = f"%{q}%"
        base_q = base_q.filter(
            or_(
                func.lower(SuperAdmin.name).ilike(func.lower(like)),
                func.lower(SuperAdmin.email).ilike(func.lower(like)),
                func.coalesce(SuperAdmin.phone, "").ilike(like),
            )
        )

    # accurate total
    count_sq = base_q.order_by(None).with_entities(SuperAdmin.id).subquery()
    total = db.query(func.count()).select_from(count_sq).scalar() or 0

    rows = (
        base_q.order_by(SuperAdmin.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [UserOut.model_validate(r) for r in rows]

    return {
        "items": items,
        "page": page,
        "pageSize": page_size,
        "total": total,
        "totalPages": ceil(total / page_size) if page_size else 0,
        "success": True,
    }


# ---------- Auth ----------


def _split_name(full: Optional[str]) -> tuple[str, str]:
    s = (full or "").strip()
    if not s:
        return "", ""
    parts = s.split()
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def _get_permissions_for_role(
    db: Session, role: Optional[Role]
) -> List[PermissionMiniOut]:
    if role is None:
        perms = db.query(Permission).order_by(Permission.name.asc()).all()
    else:
        perms = (
            db.query(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .filter(RolePermission.role_id == role.id, RolePermission.is_active == True)
            .order_by(Permission.name.asc())
            .all()
        )
    return [
        PermissionMiniOut(
            id=p.id,
            name=p.name,
            action=getattr(p, "action", None),
            show_on_menu=bool(getattr(p, "show_on_menu", False)),
        )
        for p in perms
    ]


def authenticate_user(db: Session, login_data: UserLogin, request: Request):
    superuser = (
        db.query(SuperAdmin)
        .filter(
            or_(
                SuperAdmin.email == login_data.email,
                SuperAdmin.phone == login_data.email,
            )
        )
        .first()
    )

    if not superuser or not verify_password(login_data.password, superuser.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # role resolution (root => None)
    role = (
        db.query(Role).filter(Role.id == superuser.role_id).first()
        if superuser.role_id
        else None
    )
    role_name = role.name if role else "Super Admin"

    # tokens
    access_token = create_access_token(data={"sub": str(superuser.id)})
    refresh_token = create_refresh_token(data={"sub": str(superuser.id)})

    # base user payload
    user_out = UserOut.model_validate(superuser)

    # ensure fname/lname are set
    f, l = _split_name(superuser.name)
    user_out.fname = f or None
    user_out.lname = l or None

    # legacy role fields (still useful to keep)
    user_out.role_id = role.id if role else None
    user_out.role_name = role_name

    # tokens + token_type now INSIDE data
    user_out.access_token = access_token
    user_out.refresh_token = refresh_token
    user_out.token_type = "bearer"

    # embed role object with permissions INSIDE data
    permissions = _get_permissions_for_role(db, role)
    user_out.role = RoleWithPermissionsOut(
        id=role.id if role else None,
        name=role_name,
        permissions=permissions,
    )

    return {
        "data": user_out,
        "success": True,
        "message": "SuperAdmin logged in successfully",
    }


def refresh_access_token(refresh_token: str):
    payload = verify_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    user_data = {"sub": payload["sub"]}
    access_token = create_access_token(user_data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }
