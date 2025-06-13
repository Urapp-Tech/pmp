from uuid import uuid4
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class SuperAdmin(Base):
    __tablename__ = "super_admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    # gender = Column(String, nullable=False)
