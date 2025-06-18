from pydantic import BaseModel, UUID4, ConfigDict
from enum import Enum
from typing import List
from datetime import datetime


class SupportTicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class SupportTicketCreate(BaseModel):
    sender_id: UUID4
    sender_role_id: UUID4
    subject: str
    message: str


class SupportTicketOut(SupportTicketCreate):
    id: UUID4
    status: SupportTicketStatus
    receiver_id: UUID4
    receiver_role_id: UUID4
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedSupportTicketResponse(BaseModel):
    success: bool
    message: str
    total: int
    page: int
    size: int
    items: List[SupportTicketOut]

    model_config = ConfigDict(from_attributes=True)
