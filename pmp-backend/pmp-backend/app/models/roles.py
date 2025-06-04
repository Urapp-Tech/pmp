from sqlalchemy import Column, String, ForeignKey, Boolean, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")
    )
    name = Column(String(255), nullable=False)
    desc = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")
    )
    role = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    permission = Column(
        UUID(as_uuid=True), ForeignKey("permissions.id"), nullable=False
    )
    is_active = Column(Boolean, default=True)
