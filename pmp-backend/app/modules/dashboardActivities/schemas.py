from pydantic import BaseModel


class ActivitySummaryResponse(BaseModel):
    active_landlords: int
    active_properties: int
    active_tickets: int
