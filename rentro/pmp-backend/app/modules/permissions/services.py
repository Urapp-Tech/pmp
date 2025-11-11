from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.permissions import Permission as PermissionModel
from app.modules.permissions.schemas import (
    PermissionCreate,
    PermissionUpdate,
    PermissionOut,
    ChildPermissionOut,
)
from uuid import uuid4
from fastapi import HTTPException, status
from app.utils.slug import to_kebab_case  # your custom util to convert to kebab-case

# from app.core.config import SERVER_BASE_PATH
from app.core.config import settings


def get_permissions(db: Session) -> dict:
    all_permissions = db.query(PermissionModel).all()

    parent_map = {}
    children_map = {}

    for perm in all_permissions:
        if perm.permission_parent is None:
            parent_map[perm.id] = perm
        else:
            children_map.setdefault(perm.permission_parent, []).append(perm)

    result = []
    for parent_id, parent in parent_map.items():
        children = children_map.get(parent_id, [])
        result.append(
            PermissionOut(
                id=parent.id,
                name=parent.name,
                desc=parent.desc,
                permission_type=parent.permission_type,
                data=[ChildPermissionOut.from_orm(child) for child in children],
            )
        )

    return {
        "items": result,
        "success": True,
        "message": "Permissions retrieved successfully",
        "total": len(result),
    }


def create_permission(db: Session, body: PermissionCreate):
    try:
        existing = (
            db.query(PermissionModel).filter(PermissionModel.name == body.name).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Permission already exists",
            )

        # Create parent permission
        parent_id = uuid4()
        parent_permission = PermissionModel(
            id=parent_id,
            name=body.name,
            desc=body.desc,
            permission_type=body.permission_type,
            show_on_menu=False,
            is_active=True,
            permission_parent=None,
            # created_by=body.created_by,
            # updated_by=body.created_by,
        )
        db.add(parent_permission)

        url_param = to_kebab_case(body.name)

        children = []
        for index, item in enumerate(body.data):
            # Check if child permission exists
            exists = (
                db.query(PermissionModel)
                .filter(PermissionModel.name == item.name)
                .first()
            )
            if exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Permission '{item.name}' already exists",
                )

            child = PermissionModel(
                id=uuid4(),
                name=item.name,
                desc=item.desc,
                action=f"{settings.server_base_path}/admin/{url_param}/{item.action}",
                permission_type=body.permission_type,
                permission_sequence=index + 1,
                permission_parent=parent_id,
                show_on_menu=item.show_on_menu,
                is_active=True,
                # created_by=body.created_by,
                # updated_by=body.created_by,
            )
            children.append(child)

        parent_permission.data = children

        db.add_all(children)
        db.commit()
        db.refresh(parent_permission)
        return parent_permission

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction failed: {str(e)}",
        )


def update_permission(db: Session, permission_id: str, body: PermissionUpdate):
    try:
        parent = (
            db.query(PermissionModel)
            .filter(
                PermissionModel.id == permission_id,
                PermissionModel.permission_parent == None,
            )
            .first()
        )

        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found",
            )

        parent.name = body.name
        parent.desc = body.desc
        url_param = to_kebab_case(body.name)

        existing_children = (
            db.query(PermissionModel)
            .filter(PermissionModel.permission_parent == parent.id)
            .all()
        )
        existing_map = {
            f"{item.name}_{item.action}": item for item in existing_children
        }

        for child in existing_children:
            child.is_active = False

        new_children = []

        for index, item in enumerate(body.data):
            key = f"{item.name}_{item.action}"
            action_url = f"{settings.server_base_path}/admin/{url_param}/{item.action}"

            if key in existing_map:
                existing = existing_map[key]
                existing.name = item.name
                existing.desc = item.desc
                existing.action = action_url
                existing.permission_sequence = index + 1
                existing.show_on_menu = item.show_on_menu
                existing.is_active = True
            else:
                new_perm = PermissionModel(
                    id=uuid4(),
                    name=item.name,
                    desc=item.desc,
                    action=action_url,
                    permission_type=body.permission_type,
                    permission_sequence=index + 1,
                    permission_parent=parent.id,
                    show_on_menu=item.show_on_menu,
                    is_active=True,
                )
                new_children.append(new_perm)

        parent.data = new_children
        db.add_all(new_children)
        db.commit()
        db.refresh(parent)
        return parent

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Update failed: {str(e)}",
        )
