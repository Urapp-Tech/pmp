from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.users import User
from app.models.roles import Role
import os

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"

oauth2_scheme = HTTPBearer()


def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        token_str = token.credentials
        print("🪪 Raw Token:", token_str)

        payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
        print("🧾 Payload:", payload)

        user_id: str = payload.get("sub")
        if not user_id:
            print("❌ No user ID in token")
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).get(user_id)
        if not user:
            print("❌ No user found for ID:", user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User inactive or not found")

        return user
    except JWTError as e:
        print("❌ JWT Error:", str(e))
        raise HTTPException(status_code=401, detail="Invalid token")


def has_roles(required_roles: list[str]):
    def role_checker(
        current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
    ):
        role = db.query(Role).filter(Role.id == current_user.role_id).first()
        if not role or role.name not in required_roles:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return current_user

    return role_checker
