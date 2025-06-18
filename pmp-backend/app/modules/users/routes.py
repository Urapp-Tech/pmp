from fastapi import (
    APIRouter,
    Depends,
    Query,
    Request,
    Form,
    UploadFile,
    File,
    HTTPException,
)
from typing import Optional
from pydantic import EmailStr, ValidationError
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from uuid import UUID
from app.modules.users.schemas import (
    UserLogin,
    UserCreate,
    UserOut,
    LoginResponse,
    TokenSchema,
    TokenRefreshRequest,
    PaginatedUserResponse,
)
from app.modules.users.services import (
    create_user,
    get_users,
    authenticate_user,
    refresh_access_token,
)


# parse user data
def parse_user_create(
    fname: str = Form(...),
    lname: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    phone: str = Form(...),
    gender: Optional[str] = Form(None),
    landlord_id: Optional[UUID] = Form(None),
    role_id: UUID = Form(...),
    profile_pic: UploadFile = File(None),
):
    try:
        user_data = UserCreate(
            fname=fname,
            lname=lname,
            email=email,
            password=password,
            phone=phone,
            gender=gender,
            landlordId=landlord_id,
            roleId=role_id,
        )
        return {"user_data": user_data, "profile_pic": profile_pic}
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login any user of [landlord, managers and tenant users]",
)
def login(user: UserLogin, db: Session = Depends(get_db), request: Request = None):
    return authenticate_user(db, user, request)


@router.post("/refresh/token", response_model=TokenSchema)
def refresh_token(request: TokenRefreshRequest):
    return refresh_access_token(request.refresh_token)


@router.post("/create", response_model=UserOut, summary="Create a new user")
def create(parsed: dict = Depends(parse_user_create), db: Session = Depends(get_db)):
    return create_user(db, parsed["user_data"], parsed["profile_pic"])


# @router.get("/list", response_model=list[UserOut])
# def read(db: Session = Depends(get_db)):
#     return get_users(db)


@router.get("/list", response_model=PaginatedUserResponse)
def read_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_users(db=db, page=page, size=size, search=search)
