import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
from app.db.database import Base  # your declarative base
from sqlalchemy.orm import relationship, backref

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    tenant_type = Column(String(255), nullable=True)
    civil_id = Column(String(255), nullable=True)
    nantionality = Column(String(255), nullable=True)
    legal_case = Column(default=False, nullable=False)
    language = Column(String(255), nullable=True)
    status = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default="now()", nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default="now()", nullable=False)