from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import date

class InvoiceReportFilter(BaseModel):
    from_date: Optional[date]
    to_date: Optional[date]
    status: Optional[str] = None  # e.g., "paid"
    landlord_id: Optional[UUID4] = None