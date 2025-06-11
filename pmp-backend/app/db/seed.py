from uuid import uuid4
from sqlalchemy.exc import SQLAlchemyError
from app.db.database import SessionLocal  # ✅ Correct session import
from app.models.roles import Role
from app.models.permissions import Permission
from app.models.super_admins import SuperAdmin  
from app.utils.bcrypt import hash_password
from app.utils.slug import to_kebab_case

def seed_permissions(db, parent_name: str, actions: list[str], permission_type: str = "backend"):
    parent_id = uuid4()
    existing = db.query(Permission).filter_by(name=parent_name).first()
    if existing:
        print(f"ℹ️ Parent permission '{parent_name}' already exists.")
        return

    parent = Permission(
        id=parent_id,
        name=parent_name,
        desc=f"{parent_name} management",
        permission_type=permission_type,
        show_on_menu=False,
        is_active=True,
        permission_parent=None,
    )
    db.add(parent)

    for i, action in enumerate(actions):
        action_name = f"{action.capitalize()} {parent_name}"
        permission = Permission(
            id=uuid4(),
            name=action_name,
            desc=f"{action_name} permission",
            permission_type=permission_type,
            permission_sequence=i + 1,
            permission_parent=str(parent_id),
            action=f"/admin/{to_kebab_case(parent_name)}/{action}",
            show_on_menu=True,
            is_active=True,
        )
        db.add(permission)

    print(f"✅ Seeded permissions for: {parent_name}")


def seed_roles_permissions_users():
    db = SessionLocal()  # ✅ Correct session instantiation
    try:
        # 1. Seed Super Admin Role
        role_name = "Super Admin"
        role = db.query(Role).filter_by(name=role_name).first()
        if not role:
            role = Role(id=uuid4(), name=role_name, desc="Full access", is_active=True)
            db.add(role)
            db.commit()
            db.refresh(role)
            print("✅ Super Admin role created.")
        else:
            print("ℹ️ Super Admin role already exists.")

        # 2. Seed Permissions
        modules = ["User", "Role", "Permission"]
        actions = ["create", "view", "update", "delete"]

        for module in modules:
            seed_permissions(db, f"{module} Management", actions)

        db.commit()

        # 3. Create Admin User
        email = "admin@gmail.com"
        user = db.query(SuperAdmin).filter_by(email=email).first()
        if not user:
            user = SuperAdmin(
                id=uuid4(),
                name="Admin",
                phone="12312313",
                email=email,
                password=hash_password("123"),  # ❗ Don't use plain text passwords in prod
                gender="male",
                # is_active=True,
            )
            db.add(user)
            db.commit()
            print("✅ Admin user created.")
        else:
            print("ℹ️ Admin user already exists.")

    except SQLAlchemyError as e:
        db.rollback()
        print("❌ Seeder failed:", str(e))
    finally:
        db.close()


if __name__ == "__main__":
    seed_roles_permissions_users()
    print("✅ Seeder completed.")
