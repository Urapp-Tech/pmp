from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Body,
    UploadFile,
    File,
    Form,
    Request,
)
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime, date, time, timezone
from fastapi import UploadFile as FastapiUploadFile
from starlette.datastructures import UploadFile as StarletteUploadFile

from sqlalchemy.orm import Session
from app.db.database import get_db

from . import services
from .schemas import (
    ManualPaymentCreate,
    ManualPaymentUpdate,
    ManualPaymentOut,
    ManualPaymentListResponse,
    LovResponse,
    ManualPaymentUpdateResponse,
)

router = APIRouter(prefix="/manual-payments", tags=["Manual payments"])


# CREATE
@router.post("/create", response_model=ManualPaymentUpdateResponse)
async def create_manual_payment(
    request: Request,
    db: Session = Depends(get_db),
    role: str = Query(..., description="superadmin | landlord"),
    actor_id: Optional[UUID] = Query(
        None, description="superadmin.id if role=superadmin, user.id if role=landlord"
    ),
    admin_user_id: Optional[UUID] = Query(None),
    payload: Optional[str] = Form(None),
    payload_json: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    body: Optional[ManualPaymentCreate] = Body(None),
):
    try:
        if actor_id is None and admin_user_id is not None:
            actor_id = admin_user_id
        if actor_id is None:
            raise HTTPException(
                status_code=400, detail="actor_id (or admin_user_id) is required"
            )

        raw = payload_json or payload
        if raw is None and body is None:
            try:
                form = await request.form()
                raw = form.get("payload") or form.get("payload_json")
            except Exception:
                raw = None

        if raw is not None:
            try:
                dto = ManualPaymentCreate.model_validate_json(raw)
            except Exception as e:
                raise HTTPException(
                    status_code=422, detail=f"Invalid payload JSON: {e}"
                )
        elif body is not None:
            dto = body
        else:
            raise HTTPException(status_code=400, detail="Missing payload")

        result = services.create_manual_payment(
            db=db,
            payload=dto,
            actor_role=role,
            actor_id=actor_id,
            files=files,
        )
        # result is already {"items": ..., "success": True, "msg": "..."}
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# UPDATE
def _is_upload_file(obj: Any) -> bool:
    return isinstance(obj, (FastapiUploadFile, StarletteUploadFile))


def _non_empty_files(files: List[Any]) -> List[Any]:
    """
    Keep only files with a filename and >0 size.
    Uses seek/tell or a 1-byte peek fallback.
    """
    out: List[Any] = []
    for f in files:
        if not _is_upload_file(f):
            continue
        filename = getattr(f, "filename", "")
        if not filename:
            continue
        size_ok = False
        try:
            # Try size check
            f.file.seek(0, 2)  # end
            size = f.file.tell()
            f.file.seek(0)  # reset
            size_ok = size > 0
        except Exception:
            # Fallback: peek 1 byte
            try:
                b = f.file.read(1)
                size_ok = bool(b)
                f.file.seek(0)
            except Exception:
                size_ok = False
        if size_ok:
            out.append(f)
    return out


@router.post("/update/{payment_id}", response_model=ManualPaymentUpdateResponse)
async def update_manual_payment(
    payment_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Accepts either:
      - application/json
      - multipart/form-data (payload_json or payload) + files (one or many)
    """
    content_type = (request.headers.get("content-type") or "").lower()
    dto: Optional[ManualPaymentUpdate] = None
    files_collected: List[Any] = []

    try:
        # ---------- Parse body ----------
        if (
            "multipart/form-data" in content_type
            or "application/x-www-form-urlencoded" in content_type
        ):
            form = await request.form()

            # 1) JSON payload inside the form
            payload_str: Optional[str] = form.get("payload_json") or form.get("payload")
            if payload_str:
                dto = ManualPaymentUpdate.model_validate_json(payload_str)
            else:
                # Optional: flat form fields (no files)
                raw_form: Dict[str, Any] = {
                    k: v for k, v in form.items() if not _is_upload_file(v)
                }
                if raw_form:
                    dto = ManualPaymentUpdate.model_validate(raw_form)

            # 2) Collect files from common keys
            for key in ("files", "files[]"):
                for v in form.getlist(key):
                    if _is_upload_file(v):
                        files_collected.append(v)

            # 3) Pick up any other file fields too
            for _, v in form.multi_items():
                if _is_upload_file(v):
                    files_collected.append(v)

        else:
            # Pure JSON body
            try:
                raw = await request.json()
            except Exception:
                raw = None
            if raw is not None:
                dto = ManualPaymentUpdate.model_validate(raw)

        if dto is None:
            raise HTTPException(status_code=400, detail="Missing payload")

        # ---------- STRICT filter: drop empty/nameless files ----------
        filtered_files = _non_empty_files(files_collected)

        # ---------- Service call ----------
        item: Dict[str, Any] = services.update_manual_payment(
            db, payment_id, dto, files=filtered_files
        )

        # ---------- Envelope response ----------
        return {"items": item, "success": True, "msg": "Manual payment updated"}

    except ValueError as e:
        # Not found / business-rule errors raised as ValueError in service
        raise HTTPException(status_code=404, detail=str(e))


# LIST
def _parse_iso_datetime_or_date(s: Optional[str]) -> Optional[datetime]:
    """
    Accepts:
      - '2025-10-09T13:00:00Z'
      - '2025-10-09T13:00:00+05:00'
      - '2025-10-09' (interpreted as local-day start for from, end-of-day for to outside this helper)
    Returns timezone-aware UTC datetime where possible.
    """
    if not s:
        return None
    s = s.strip()
    try:
        # Try full ISO first
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            # Assume UTC if naive
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except ValueError:
        # Try date-only
        try:
            d = date.fromisoformat(s)
            # Return naive midnight; caller will adjust to start/end-of-day
            return datetime.combine(d, time.min, tzinfo=timezone.utc)
        except ValueError:
            return None


@router.get("/list", response_model=ManualPaymentListResponse)
def list_manual_payments_route(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    q: Optional[str] = Query(None),
    landlord_id: Optional[UUID] = Query(None, description="Filter by landlord"),
    user_id: Optional[UUID] = Query(None, description="Filter by user (landlord user)"),
    invoice_id: Optional[UUID] = Query(None),
    date_from: Optional[str] = Query(None, description="ISO8601 (date or datetime)"),
    date_to: Optional[str] = Query(None, description="ISO8601 (date or datetime)"),
    role: Optional[str] = Query(None, description="superadmin | landlord"),
    actor_id: Optional[UUID] = Query(
        None,
        description="If role=superadmin, may be the current super admin id; for landlord list you typically pass landlord_id instead",
    ),
):
    # Parse dates
    df = _parse_iso_datetime_or_date(date_from)
    dt = _parse_iso_datetime_or_date(date_to)

    # If user gave date-only, adjust to full-day bounds in UTC
    if df and df.time() == time.min:
        # already start-of-day UTC
        pass
    if dt and dt.time() == time.min:
        # bump to end-of-day UTC
        dt = dt.replace(hour=23, minute=59, second=59, microsecond=999999)

    return services.list_manual_payments(
        db=db,
        page=page,
        page_size=page_size,
        q=q,
        landlord_id=str(landlord_id) if landlord_id else None,
        user_id=str(user_id) if user_id else None,
        invoice_id=str(invoice_id) if invoice_id else None,
        date_from=df,
        date_to=dt,
        role=role,
        actor_id=str(actor_id) if actor_id else None,
    )


# LOV (paid + manual)
@router.get("/invoices/lov", response_model=LovResponse)
def invoices_lov(
    q: Optional[str] = Query(None),
    landlord_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return services.invoices_lov_paid(db=db, q=q, landlord_id=landlord_id)


@router.get("/unpaid-invoices/lov", response_model=LovResponse)
def invoices_lov(
    q: Optional[str] = Query(None),
    landlord_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return services.unpaid_invoices_lov(db=db, q=q, landlord_id=landlord_id)
