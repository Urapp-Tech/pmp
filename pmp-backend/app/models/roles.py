from sqlalchemy import Column, String, ForeignKey, Boolean, text, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, backref
from app.db.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")
    )
    name = Column(String(255), nullable=False)
    desc = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    landlord_id = Column(UUID(as_uuid=True), ForeignKey("landlords.id"), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )

    role_permissions = relationship(
        "RolePermission", back_populates="role", lazy="joined"
    )

    # ✅ add this relationship
    permissions = relationship(
        "Permission",
        secondary="role_permissions",
        primaryjoin="Role.id == RolePermission.role_id",
        secondaryjoin="Permission.id == RolePermission.permission_id",
        viewonly=True,
        lazy="joined",
    )


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")
    )
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    permission_id = Column(
        UUID(as_uuid=True), ForeignKey("permissions.id"), nullable=False
    )
    is_active = Column(Boolean, default=True)

    role = relationship("Role", back_populates="role_permissions")
    permission_obj = relationship("Permission", lazy="joined")
