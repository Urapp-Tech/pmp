from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from app.models.landlords import Landlord
from app.models.users import User
from app.models.properties import Property
from app.models.roles import Role
from app.models.managers import Manager
from app.models.tenants import Tenant
from app.models.invoices import Invoice, InvoiceStatus
from app.models.property_units import PropertyUnit
from app.models.support_tickets import SupportTicketStatus, SupportTicket
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from app.utils.email_service import render_template, send_email


from app.models.contact_us import ContactUs
from app.modules.contact.schemas import ContactUsCreate, ContactUsCreateResponse

def create_contact_us(db: Session, contact: ContactUsCreate) :
    db_contact = ContactUs(
        fname=contact.fname,
        lname=contact.lname,
        email=contact.email,
        phone=contact.phone,
        message=contact.message
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    html_content = render_template(
        "paid_invoice.html",
        {
            "name": f"{contact.fname} {contact.lname}",
            "phone": contact.phone,
            "message": contact.message,
        },
    )
    # for_admin = render_template(
    #     "contact_us.html",
    #     {
    #         "name": f"{contact.fname} {contact.lname}",
    #         "phone": contact.phone,
    #         "message": contact.message,
    #     },
    # )
    for_user = render_template(
        "thank_you.html",
        {
            "name": f"{contact.fname} {contact.lname}",
        },
    )
    # send_email(
    #     to_email="admin@gmail.com",
    #     subject="New Contact Us Submission",
    #     html_content=for_admin,
    # )
    send_email(
        to_email=contact.email,
        subject="Your Inquiry has been received",
        html_content=for_user,
    )

    return ContactUsCreateResponse(
        success=True,
        message="Contact Us created successfully",
        items=[]
    )

def get_contact_us(db: Session, page: int = 1, size: int = 10, search: Optional[str] = None ) -> list[ContactUs]:
    query = db.query(ContactUs)
    if search:
        query = query.filter(
            func.lower(ContactUs.fname).contains(search.lower()) |
            func.lower(ContactUs.lname).contains(search.lower()) |
            func.lower(ContactUs.email).contains(search.lower())
        )
    total = query.count()
    contacts = query.offset((page - 1) * size).limit(size).all()
    return {
        "success": True,
        "total": total,
        "page": page,
        "size": size,
        "items": contacts,
    }

def delete_contact_us(db: Session, contact_id: UUID):
    contact = db.query(ContactUs).filter(ContactUs.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact Us not found")
    db.delete(contact)
    db.commit()
    return {
        "success": True,
        "message": "Contact Us deleted successfully"
    }