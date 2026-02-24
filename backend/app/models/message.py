from sqlalchemy import Column, String, DateTime, ForeignKey, func, Enum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    channel_id = Column(String, ForeignKey("channels.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    type = Column(Enum("text", "code", "ai", "bot", name="message_type"), default="text")
    parent_id = Column(String, ForeignKey("messages.id"), nullable=True)  # thread reply
    file_url = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    channel = relationship("Channel", back_populates="messages")
    author = relationship("User", back_populates="messages", foreign_keys=[user_id])
    reactions = relationship("Reaction", back_populates="message", cascade="all, delete-orphan")
    replies = relationship("Message", back_populates="parent", foreign_keys=[parent_id])
    parent = relationship("Message", back_populates="replies", remote_side=[id])


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji = Column(String(16), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    message = relationship("Message", back_populates="reactions")
