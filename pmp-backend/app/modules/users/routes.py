from fastapi import (
    APIRouter,
    Depends,
    Query,
    Request,
    Form,
    UploadFile,
    File,
    HTTPException,
    Path,
)
from typing import Optional, List, Union
from pydantic import EmailStr, ValidationError
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from uuid import UUID
from app.models.users import User
from app.core.security import has_roles
from app.modules.users.schemas import (
    UserLogin,
    UserCreate,
    UserUpdate,
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
    update_user,
    delete_user,
    authenticate_user,
    refresh_access_token,
    get_users_by_landlord,
    get_assigned_units_managers,
    get_users_lov_by_landlord,
    get_all_active_users_service,
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


def parse_user_update(
    fname: Optional[str] = Form(None),
    lname: Optional[str] = Form(None),
    email: Optional[EmailStr] = Form(None),
    password: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    landlordId: Optional[UUID] = Form(None),
    roleType: Optional[str] = Form(None),
    profilePic: Union[UploadFile, str, None] = File(None),
    isActive: Optional[str] = Form(None),
):

    password = password if password != "" else None
    fname = fname if fname != "" else None
    lname = lname if lname != "" else None
    phone = phone if phone != "" else None
    email = email if email != "" else None
    gender = gender if gender != "" else None
    roleType = roleType if roleType != "" else None

    if isinstance(profilePic, str) and profilePic == "":
        profilePic = None

    if isinstance(isActive, str):
        isActive = isActive.lower() == "true"

    print("Parsed isActive value:", isActive)

    field_dict = {
        "fname": fname,
        "lname": lname,
        "email": email,
        "password": password,
        "phone": phone,
        "gender": gender,
        "landlord_id": landlordId,
        "role_type": roleType,
        "is_active": isActive,
    }

    filtered_fields = {k: v for k, v in field_dict.items() if v is not None}

    try:
        update_data = UserUpdate(**filtered_fields)
        return {
            "user_data": update_data,
            "profile_pic": profilePic,
        }
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


@router.post(
    "/update/{user_id}",
    response_model=UserResponseOut,
    summary="Update user (FormData)",
)
def update_user_route(
    user_id: UUID = Path(...),
    parsed: dict = Depends(parse_user_update),
    db: Session = Depends(get_db),
):
    return update_user(db, user_id, parsed["user_data"], parsed["profile_pic"])


@router.post(
    "/delete/{user_id}",
    response_model=UserResponseOut,
    summary="Soft delete (deactivate) a user",
)
def soft_delete_user_route(user_id: UUID = Path(...), db: Session = Depends(get_db)):
    return delete_user(db, user_id)


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


@router.get("/user-list/{landlord_id}", response_model=PaginatedTenantUserResponse)
def get_tenant_users(
    landlord_id: UUID,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_users_by_landlord(
        db=db,
        landlord_id=landlord_id,
        page=page,
        size=size,
        search=search,
    )


@router.get("/lov/{landlord_id}", response_model=List[UserLOV])
def user_lov(landlord_id: UUID, db: Session = Depends(get_db)):
    return get_users_lov_by_landlord(landlord_id, db)


@router.get("/tenant-users/list", response_model=PaginatedTenantUserResponse)
def get_tenant_users(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_all_active_users_service(db=db, page=page, limit=limit, search=search)
