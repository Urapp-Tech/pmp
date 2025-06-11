# services/roles.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.roles import Role, RolePermission
from app.models.users import User
from app.modules.roles.schemas import RoleCreate, RoleUpdate
from fastapi import HTTPException, status
import uuid


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
            desc=body.desc,
            is_active=True,
        )
        db.add(role)
        db.flush()

        new_data = []
        for group in body.data:
            role_permission = RolePermission(
                id=uuid.uuid4(),
                role=role.id,
                permission=group.id,
                is_active=group.status,
            )
            new_data.append(role_permission)

        if not new_data:
            raise HTTPException(status_code=400, detail="No role permissions provided")

        db.add_all(new_data)
        db.commit()
        db.refresh(role)

        return role

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
        role.desc = body.desc

        db.query(RolePermission).filter(RolePermission.role == role.id).update(
            {RolePermission.is_active: False}
        )

        for item in body.data:
            existing_permission = (
                db.query(RolePermission)
                .filter(
                    RolePermission.role == role.id,
                    RolePermission.permission == item.id,
                )
                .first()
            )

            if existing_permission:
                existing_permission.is_active = item.status
            else:
                new_permission = RolePermission(
                    id=uuid.uuid4(),
                    role=role.id,
                    permission=item.id,
                    is_active=item.status,
                )
                db.add(new_permission)

        db.commit()
        db.refresh(role)

        return {"role": role, "message": "Role has been updated"}

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Update failed: {str(e)}",
        )
