from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, get_db
from app.modules.superusers.schemas import (
    UserLogin,
    UserCreate,
    UserOut,
    LoginResponse,
    TokenSchema,
    TokenRefreshRequest,
)
from app.modules.superusers.services import (
    create_user,
    get_users,
    authenticate_user,
    refresh_access_token,
)

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(user: UserLogin, db: Session = Depends(get_db), request: Request = None):
    return authenticate_user(db, user, request)


@router.post("/refresh/token", response_model=TokenSchema)
def refresh_token(request: TokenRefreshRequest):
    return refresh_access_token(request.refresh_token)


@router.post("/create", response_model=UserOut, summary="Create a new user")
def create(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@router.get("/list", response_model=list[UserOut])
def read(db: Session = Depends(get_db)):
    return get_users(db)
