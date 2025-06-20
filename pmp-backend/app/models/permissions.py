from sqlalchemy import Column, String, Integer, Boolean, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
from sqlalchemy.orm import relationship, backref


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")
    )
    name = Column(String(255), nullable=False)
    permission_sequence = Column(Integer, nullable=True)
    permission_parent = Column(String(20), nullable=True)
    desc = Column(String(255), nullable=True)
    action = Column(String(255), nullable=False)
    permission_type = Column(String(255), nullable=False)
    show_on_menu = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)

    roles = relationship(
        "Role", secondary="role_permissions", back_populates="permissions"
    )
