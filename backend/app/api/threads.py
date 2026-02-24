from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.message import Message
from app.models.user import User
from app.api.auth import get_current_user
from app.ws.manager import manager

router = APIRouter()


class ThreadReply(BaseModel):
    parent_id: str
    channel_id: str
    content: str


@router.get("/{parent_id}")
async def get_thread(parent_id: str, db: AsyncSession = Depends(get_db)):
    """Get all replies for a thread."""
    result = await db.execute(
        select(Message)
        .where(Message.parent_id == parent_id)
        .order_by(Message.created_at.asc())
    )
    return result.scalars().all()


@router.post("/reply")
async def reply_to_thread(
    data: ThreadReply,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a reply to a thread."""
    reply = Message(
        channel_id=data.channel_id,
        user_id=current_user.id,
        content=data.content,
        parent_id=data.parent_id,
    )
    db.add(reply)
    await db.commit()
    await db.refresh(reply)

    await manager.broadcast(data.channel_id, {
        "type": "thread_reply",
        "parent_id": data.parent_id,
        "id": reply.id,
        "user_id": reply.user_id,
        "username": current_user.username,
        "content": reply.content,
        "created_at": str(reply.created_at),
    })

    return reply
