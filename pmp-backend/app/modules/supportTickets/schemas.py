from pydantic import BaseModel, ConfigDict, Field
from enum import Enum
from uuid import UUID
from typing import List, Optional
from datetime import datetime


class SupportTicketStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class SupportTicketCreate(BaseModel):
    sender_id: UUID = Field(..., alias="senderId")
    sender_role_id: UUID = Field(..., alias="senderRoleId")
    subject: str
    message: str


class SupportTicketUpdate(BaseModel):
    subject: Optional[str]
    message: Optional[str]


class SupportTicketOut(BaseModel):
    id: UUID
    status: SupportTicketStatus
    subject: str
    message: str
    sender_id: UUID = Field(..., alias="senderId")
    sender_role_id: UUID = Field(..., alias="senderRoleId")
    receiver_id: UUID = Field(..., alias="receiverId")
    receiver_role_id: UUID = Field(..., alias="receiverRoleId")
    images: Optional[List[str]]
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SupportTicketResponse(BaseModel):
    items: SupportTicketOut
    message: str = "Support ticket created successfully"
    success: bool = True

    model_config = ConfigDict(from_attributes=True)


class PaginatedSupportTicketResponse(BaseModel):
    success: bool
    message: str
    total: int
    page: int
    size: int
    items: List[SupportTicketOut]

    model_config = ConfigDict(from_attributes=True)


class SupportTicketStatusUpdate(BaseModel):
    ticket_id: UUID = Field(..., alias="ticketId")
    status: SupportTicketStatus
