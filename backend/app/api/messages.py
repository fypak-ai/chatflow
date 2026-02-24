from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.message import Message
from app.models.user import User
from app.api.auth import get_current_user
from app.ws.manager import manager

router = APIRouter()


class MessageCreate(BaseModel):
    channel_id: str
    content: str = ""
    type: str = "text"
    parent_id: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None


class BotMessageCreate(BaseModel):
    channel_id: str
    content: str
    type: str = "bot"


@router.get("/channel/{channel_id}")
async def get_messages(channel_id: str, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message)
        .where(Message.channel_id == channel_id, Message.parent_id.is_(None))
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/")
async def create_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = data.content
    msg_type = data.type

    # Handle /run command
    if content.startswith("/run "):
        parts = content[5:].split("\n", 1)
        lang = parts[0].strip()
        code = parts[1].strip() if len(parts) > 1 else ""
        from app.bots.code_runner import run_code
        output = await run_code(lang, code)
        content = f"```{lang}\n{code}\n```\n**Output:**\n```\n{output}\n```"
        msg_type = "code"

    elif content.startswith("@ai"):
        ctx_result = await db.execute(
            select(Message)
            .where(Message.channel_id == data.channel_id)
            .order_by(Message.created_at.desc())
            .limit(10)
        )
        history = [
            {"role": "user" if m.user_id != "ai" else "assistant", "content": m.content}
            for m in reversed(ctx_result.scalars().all())
        ]
        from app.bots.ai_bot import handle_ai_mention
        ai_response = await handle_ai_mention(content, history)
        ai_msg = Message(
            channel_id=data.channel_id,
            user_id=None,
            content=ai_response,
            type="ai",
        )
        db.add(ai_msg)
        await db.flush()
        await db.commit()
        await db.refresh(ai_msg)
        await manager.broadcast(data.channel_id, {
            "type": "message",
            "id": ai_msg.id,
            "channel_id": data.channel_id,
            "user_id": "ai",
            "content": ai_response,
            "message_type": "ai",
            "created_at": str(ai_msg.created_at),
        })
        msg_type = "text"

    msg = Message(
        channel_id=data.channel_id,
        user_id=current_user.id,
        content=content,
        type=msg_type,
        parent_id=data.parent_id,
        file_url=data.file_url,
        file_name=data.file_name,
        file_type=data.file_type,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    payload = {
        "type": "message",
        "id": msg.id,
        "channel_id": msg.channel_id,
        "user_id": msg.user_id,
        "username": current_user.username,
        "content": msg.content,
        "message_type": msg.type,
        "created_at": str(msg.created_at),
        "file_url": msg.file_url,
        "file_name": msg.file_name,
        "file_type": msg.file_type,
    }
    await manager.broadcast(data.channel_id, payload)
    return msg


@router.post("/bot")
async def bot_message(data: BotMessageCreate, db: AsyncSession = Depends(get_db)):
    msg = Message(channel_id=data.channel_id, user_id=None, content=data.content, type="bot")
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    await manager.broadcast(data.channel_id, {
        "type": "message", "id": msg.id,
        "user_id": "bot", "content": msg.content,
        "message_type": "bot", "created_at": str(msg.created_at),
    })
    return msg
