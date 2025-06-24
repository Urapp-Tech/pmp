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
from typing import Optional, List, Union
from pydantic import EmailStr, ValidationError
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from uuid import UUID
from app.modules.users.schemas import (
    UserLogin,
    UserCreate,
    UserResponseOut,
    UserLOV,
    LoginResponse,
    TokenSchema,
    TokenRefreshRequest,
    PaginatedManagerUserResponse,
    PaginatedTenantUserResponse,
)
from app.modules.users.services import (
    create_user,
    authenticate_user,
    refresh_access_token,
    get_users_by_role,
    # get_manager_users_by_role,
    get_assigned_units_managers,
    get_users_lov_by_landlord,
)


# parse user data
def parse_user_create(
    fname: str = Form(...),
    lname: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    phone: str = Form(...),
    gender: Optional[str] = Form(None),
    landlordId: Optional[UUID] = Form(None),
    roleType: str = Form(...),
    profilePic: Union[UploadFile, str] = File(None),
):

    if isinstance(profilePic, str) and profilePic == "":
        profilePic = None

    print("profile_pic", profilePic)
    try:
        user_data = UserCreate(
            fname=fname,
            lname=lname,
            email=email,
            password=password,
            phone=phone,
            gender=gender,
            landlordId=landlordId,
            roleType=roleType,
        )
        return {"user_data": user_data, "profile_pic": profilePic}
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


@router.post("/create", response_model=UserResponseOut, summary="Create a new user")
def create(parsed: dict = Depends(parse_user_create), db: Session = Depends(get_db)):
    return create_user(db, parsed["user_data"], parsed["profile_pic"])


# @router.get("/list/{landlord_id}", response_model=PaginatedUserResponse)
# def read_users(
#     page: int = Query(1, ge=1),
#     size: int = Query(10, ge=1),
#     search: Optional[str] = Query(None),
#     db: Session = Depends(get_db),
# ):
#     return get_users(db=db, page=page, size=size, search=search)


@router.get("/manager-list/{landlord_id}", response_model=PaginatedManagerUserResponse)
def get_managers_users(
    landlord_id: UUID,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_assigned_units_managers(
        db=db,
        landlord_id=landlord_id,
        role_name="Manager",
        page=page,
        size=size,
        search=search,
    )


@router.get("/user-list/{user_id}", response_model=PaginatedTenantUserResponse)
def get_tenant_users(
    # landlord_id: UUID,
    user_id: UUID,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_users_by_role(
        db=db,
        # landlord_id=landlord_id,
        # role_name="User",
        user_id=user_id,
        page=page,
        size=size,
        search=search,
    )


@router.get("/lov/{landlord_id}", response_model=List[UserLOV])
def user_lov(landlord_id: UUID, db: Session = Depends(get_db)):
    return get_users_lov_by_landlord(landlord_id, db)
