from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.modules.users.schemas import (
    UserLogin,
    UserCreate,
    UserOut,
    LoginResponse,
    TokenSchema,
    TokenRefreshRequest,
)
from app.modules.users.services import (
    create_user,
    get_users,
    authenticate_user,
    refresh_access_token,
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login", response_model=LoginResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    return authenticate_user(db, user)


@router.post("/refresh/token", response_model=TokenSchema)
def refresh_token(request: TokenRefreshRequest):
    return refresh_access_token(request.refresh_token)


@router.post("/create", response_model=UserOut, summary="Create a new user")
def create(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@router.get("/list", response_model=list[UserOut])
def read(db: Session = Depends(get_db)):
    return get_users(db)
