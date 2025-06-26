from fastapi import APIRouter, Depends
from typing import List
from datetime import date, datetime
from uuid import UUID
from app.modules.reports.schemas import (
    InvoiceReportFilter,
)
from sqlalchemy.orm import Session, joinedload
from typing import Optional, Dict, Any
from app.models.invoice_items import InvoiceItem
from app.models.invoices import Invoice
from app.models.managers import Manager
from app.models.tenants import Tenant
from app.models.users import User

# def get_invoice_report_service(
#     db: Session,
    
#     from_date: Optional[date] = None,
#     to_date: Optional[date] = None,
#     status: Optional[str] = None,
#     landlord_id: Optional[UUID] = None
# ) -> Dict[str, Any]:

#     query = db.query(Invoice).options(joinedload(Invoice.items)).filter(Invoice.landlord_id == landlord_id)
#     # if from_date:
#     #     query = query.filter(Invoice.payment_date >= from_date)
#     # if to_date:
#     #     query = query.filter(Invoice.payment_date <= to_date)
#     # if status:
#     #     query = query.filter(Invoice.status == status)

#     invoices = query.all()
#     total_paid = sum(inv.paid_amount or 0 for inv in invoices)

#     return {
#         "success": True,
#         "message": "Invoice report fetched successfully.",
#         "total": len(invoices),
#         "items": invoices,
#         "total_paid": total_paid,
#     }

from typing import Optional, Dict, Any
from datetime import date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
# from app.models import Invoice, InvoiceItem, Manager, User, Tenant


def get_invoice_report_service(
    db: Session,
    user_id: Optional[str] = None,
    role_id: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    status: Optional[str] = None,
    # search: Optional[str] = "",
) -> Dict[str, Any]:
    if role_id == "Super Admin":
        return {
            "success": True,
            "message": "Super Admin is not allowed to view reports.",
            "total": 0,
            "items": [],
            "total_paid": 0,
        }

    query = db.query(Invoice).options(joinedload(Invoice.items))

    if role_id == "Landlord":
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.landlord_id:
            return {
                "success": True,
                "message": "Landlord not found.",
                "total": 0,
                "items": [],
                "total_paid": 0,
            }
        query = query.filter(Invoice.landlord_id == user.landlord_id)

    elif role_id == "Manager":
        managers = (
            db.query(Manager)
            .filter(Manager.manager_user_id == user_id, Manager.is_active == True)
            .all()
        )
        assigned_unit_ids = list({
            m.assign_property_unit for m in managers if m.assign_property_unit
        })

        if not assigned_unit_ids:
            return {
                "success": True,
                "message": "No assigned units.",
                "total": 0,
                "items": [],
                "total_paid": 0,
            }

        query = query.join(InvoiceItem).filter(InvoiceItem.property_unit_id.in_(assigned_unit_ids))

    elif role_id == "Tenant":
        tenant = db.query(Tenant).filter(Tenant.user_id == user_id).first()
        if not tenant:
            return {
                "success": True,
                "message": "Tenant not found.",
                "total": 0,
                "items": [],
                "total_paid": 0,
            }

        query = query.filter(Invoice.tenant_id == tenant.id)

    else:
        return {
            "success": False,
            "message": "Invalid role.",
            "total": 0,
            "items": [],
            "total_paid": 0,
        }

    # Apply filters
    # parsed_from = parse_date(from_date)
    # parsed_to = parse_date(to_date)

    # if parsed_from:
    #     query = query.filter(parse_date(Invoice.invoice_date) >= parsed_from)

    # if parsed_to:
    #     query = query.filter(parse_date(Invoice.invoice_date) <= parsed_to)
    if from_date:
        query = query.filter(Invoice.created_at >= from_date)

    if to_date:
        query = query.filter(Invoice.created_at <= to_date)
        
    if status:
        query = query.filter(Invoice.status.ilike(status))

    # if search:
    #     search_term = f"%{search.lower()}%"
    #     query = query.filter(Invoice.invoice_no.ilike(search_term))

    invoices = query.distinct().all()
    total_paid = sum(int(float(inv.total_amount or 0)) for inv in invoices)


    return {
        "success": True,
        "message": "Invoice report fetched successfully.",
        "total": len(invoices),
        "items": invoices,
        "total_paid": total_paid,
    }
from datetime import datetime, date

def parse_date(date_input):
    if isinstance(date_input, date):
        return date_input  # Already a date object
    return datetime.strptime(date_input, "%Y-%m-%d").date()
