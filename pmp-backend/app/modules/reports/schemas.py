from pydantic import BaseModel, UUID4, Field
from typing import Optional, List
from datetime import date, datetime


class InvoiceReportFilter(BaseModel):

    user_id: Optional[UUID4] = None
    role_id: Optional[str] = None
    from_date: Optional[date] = Field(None, example="2024-01-01")
    to_date: Optional[date] = Field(None, example="2024-12-31")
    status: Optional[str] = Field(None, example="paid")  # e.g., "paid", "unpaid"
    # landlord_id: Optional[UUID4] = Field(None, example="123e4567-e89b-12d3-a456-426614174000")


# ---------- Request (query) ----------
class ReportsOverviewQuery(BaseModel):
    year: int = Field(..., description="Year for monthly revenue series, e.g. 2025")
    limit: int = Field(3, ge=1, le=20, description="Recent payments count")
    lookback_days: int = Field(150, ge=30, le=365, description="Unpaid aging window")
    user_id: Optional[UUID4] = None
    role_id: Optional[str] = Field(None, pattern=r"^(Landlord|Manager|User)?$")


# ---------- Response (nested blocks) ----------
class RevenuePoint(BaseModel):
    month: str  # "JAN"
    invoiced: float  # SUM(total_amount)
    collected: float  # SUM(paid_amount)


class RevenueBlock(BaseModel):
    year: int
    total_revenue: float  # sum of collected for that year
    currency: Optional[str] = None
    series: List[RevenuePoint]


class RecentPaymentItem(BaseModel):
    invoice_id: UUID4
    paid_amount: float
    currency: Optional[str] = None
    created_at: datetime
    tenant_name: Optional[str] = None
    property_name: Optional[str] = None
    unit_no: Optional[str] = None


class RecentPaymentsBlock(BaseModel):
    items: List[RecentPaymentItem]


class UnpaidBucket(BaseModel):
    label: str  # "0-30", "31-60", "61-90", "91+"
    value: float


class UnpaidAgingBlock(BaseModel):
    lookback_days: int
    total_unpaid: float
    buckets: List[UnpaidBucket]


class OccupancyBlock(BaseModel):
    total_units: int
    rented: int
    vacant: int
    percent_rented: float
    percent_vacant: float


class ReportsOverviewResponse(BaseModel):
    success: bool
    revenue: RevenueBlock
    recent_payments: RecentPaymentsBlock
    unpaid_aging: UnpaidAgingBlock
    occupancy: OccupancyBlock
