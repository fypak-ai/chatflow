from sqlalchemy import Column, String, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    channels = relationship("Channel", back_populates="workspace")
    members = relationship("WorkspaceMember", back_populates="workspace")


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    workspace_id = Column(String, ForeignKey("workspaces.id"), primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    role = Column(Enum("owner", "admin", "member", name="member_role"), default="member")
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    workspace = relationship("Workspace", back_populates="members")
