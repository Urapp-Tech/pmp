from pydantic import BaseModel, Field


class ActivitySummaryResponse(BaseModel):
    active_tenants: int = Field(None, alias="activeTenants")
    active_requests: int = Field(None, alias="activeRequests")
    current_month_unpaid_invoices: int = Field(None, alias="currentMonthUnpaidInvoices")
    current_month_paid_receipts: int = Field(None, alias="currentMonthPaidReceipts")
    active_landlords: int = Field(None, alias="activeLandlords")
    active_managers: int = Field(None, alias="activeManagers")
    pending_invoices: int = Field(None, alias="pendingInvoices")
    unresolved_tickets: int = Field(None, alias="unresolvedTickets")
