from fastapi import Request
from sqlalchemy.orm import Session
from app.models.super_admins import SuperAdmin
from app.modules.securityLogs.services import log_security_event
from app.modules.securityLogs.schemas import SecurityLogCreate
from app.models.roles import Role
from app.modules.superusers.schemas import (
    UserCreate,
    UserLogin,
    UserOut,
    LoginResponse,
    TokenSchema,
)
from app.utils.bcrypt import hash_password, verify_password
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from fastapi import HTTPException, status


def create_user(db: Session, superuser: UserCreate):
    hashed_password = hash_password(superuser.password)
    db_user = SuperAdmin(
        name=superuser.name,
        email=superuser.email,
        password=hashed_password,
        phone=superuser.phone,
        # gender=superuser.gender,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_users(db: Session):
    return db.query(SuperAdmin).all()


def authenticate_user(db: Session, login_data: UserLogin, request: Request):

    try:
        role = db.query(Role).filter(Role.name == "Super Admin").first()
        if not role:
            raise ValueError("Role 'Super Admin' not found in roles table.")

        superuser = (
            db.query(SuperAdmin).filter(SuperAdmin.email == login_data.email).first()
        )
        if not superuser or not verify_password(
            login_data.password, superuser.password
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        access_token = create_access_token(data={"sub": str(superuser.id)})
        refresh_token = create_refresh_token(data={"sub": str(superuser.id)})

        # log_data = SecurityLogCreate(
        #     action="login",
        #     description="Super Admin login successful",
        #     ip_address=request.client.host if request.client else "unknown",
        #     user_agent=request.headers.get("user-agent", "unknown"),
        # )
        # log_security_event(db, user_id=superuser.id, log_data=log_data)

        user_out = UserOut.model_validate(superuser)
        user_out.role_id = role.id if role else None
        user_out.role_name = role.name if role else None
        user_out.access_token = access_token
        user_out.refresh_token = refresh_token

        return {
            "data": user_out,
            "success": True,
            "message": "SuperAdmin logged in successfully",
            "token_type": "bearer",
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to login: {str(e)}")


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
