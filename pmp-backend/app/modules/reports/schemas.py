from pydantic import BaseModel, UUID4, Field
from typing import Optional
from datetime import date

class InvoiceReportFilter(BaseModel):
    
    user_id: Optional[UUID4] = None,
    role_id: Optional[str] = None,
    from_date: Optional[date] = Field(None, example="2024-01-01")
    to_date: Optional[date] = Field(None, example="2024-12-31")
    status: Optional[str] = Field(None, example="paid")  # e.g., "paid", "unpaid"
    # landlord_id: Optional[UUID4] = Field(None, example="123e4567-e89b-12d3-a456-426614174000")