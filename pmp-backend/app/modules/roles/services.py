# services/roles.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.roles import Role, RolePermission
from app.models.permissions import Permission
from app.models.users import User
from app.modules.roles.schemas import RoleCreate, RoleUpdate, RoleOut, RoleLOV
from fastapi import HTTPException, status
import uuid
from sqlalchemy import or_
from typing import Optional
from uuid import UUID


def get_roles(db: Session, page: int = 1, size: int = 20, search: Optional[str] = None):
    query = db.query(Role).filter(Role.name != "Super Admin")

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Role.name.ilike(search_term),
                Role.desc.ilike(search_term),
            )
        )

    total = query.count()

    roles = (
        query.order_by(Role.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    items = []

    for role in roles:

        active_permission_ids = (
            db.query(Permission.id)
            .join(RolePermission, RolePermission.permission == Permission.id)
            .filter(
                RolePermission.role == role.id,
                RolePermission.is_active == True,
                Permission.is_active == True,
            )
            .all()
        )

        active_ids = [perm_id[0] for perm_id in active_permission_ids]

        items.append(
            RoleOut(
                id=role.id,
                name=role.name,
                desc=role.desc,
                is_active=role.is_active,
                permissions=active_ids,
            )
        )

    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": items,
    }


def create_role(db: Session, body: RoleCreate):
    try:
        # super_admin = db.query(User).filter(User.is_super_admin == True).first()
        # if not super_admin:
        #     raise HTTPException(status_code=404, detail="Super admin not found")

        existing = db.query(Role).filter(Role.name == body.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role already exists",
            )

        role = Role(
            id=uuid.uuid4(),
            name=body.name,
            # desc=body.desc,
            is_active=True,
        )
        db.add(role)
        db.flush()

        # Check if permissions are provided
        if not body.data:
            raise HTTPException(status_code=400, detail="No permissions provided")

        # Create RolePermission entries
        new_permissions = [
            RolePermission(
                id=uuid.uuid4(), role=role.id, permission=perm_id, is_active=True
            )
            for perm_id in body.data
        ]
        db.add_all(new_permissions)

        db.commit()
        db.refresh(role)

        return {
            "success": True,
            "message": "Role created successfully",
            "role": role,
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


def update_role(db: Session, role_id: str, body: RoleUpdate):
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )

        existing = (
            db.query(Role).filter(Role.name == body.name, Role.id != role_id).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already in use",
            )

        role.name = body.name
        # role.desc = body.desc

        db.query(RolePermission).filter(RolePermission.role == role.id).update(
            {RolePermission.is_active: False}
        )

        for prem_id in body.data:
            existing_permission = (
                db.query(RolePermission)
                .filter(
                    RolePermission.role == role.id,
                    RolePermission.permission == prem_id,
                )
                .first()
            )

            if existing_permission:
                existing_permission.is_active = True
            else:
                new_permission = RolePermission(
                    id=uuid.uuid4(), role=role.id, permission=prem_id, is_active=True
                )
                db.add(new_permission)

        db.commit()
        db.refresh(role)

        return {
            "role": role,
            "message": "Role has been updated",
            "success": True,
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Update failed: {str(e)}",
        )


def get_role_lov(db: Session):
    roles = (
        db.query(Role)
        .filter(Role.is_active == True, Role.name != "Super Admin")
        .order_by(Role.name)
        .all()
    )
    return [RoleLOV(id=role.id, name=role.name) for role in roles]


def delete_role(db: Session, role_id: UUID):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    role.is_active = False
    db.commit()

    return {"success": True, "message": "Role deactivated successfully."}
