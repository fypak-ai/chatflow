from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from pydantic import BaseModel
from collections import defaultdict

from app.core.database import get_db
from app.models.message import Reaction
from app.api.auth import get_current_user
from app.models.user import User
from app.ws.manager import manager

router = APIRouter()

ALLOWED_EMOJIS = {
    "👍", "👎", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👀", "✅",
    "🚀", "💯", "🙏", "💪", "😎", "🤔", "⚡", "🐛", "💡", "🎯",
}


class ReactionToggle(BaseModel):
    message_id: str
    emoji: str
    channel_id: str


@router.post("/toggle")
async def toggle_reaction(
    data: ReactionToggle,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.emoji not in ALLOWED_EMOJIS:
        raise HTTPException(status_code=400, detail="Emoji não permitido")

    existing = await db.execute(
        select(Reaction).where(
            Reaction.message_id == data.message_id,
            Reaction.user_id == current_user.id,
            Reaction.emoji == data.emoji,
        )
    )
    row = existing.scalar_one_or_none()

    if row:
        await db.delete(row)
        action = "removed"
    else:
        db.add(Reaction(message_id=data.message_id, user_id=current_user.id, emoji=data.emoji))
        action = "added"

    await db.commit()

    # Fetch updated counts for this message
    counts_result = await db.execute(
        select(Reaction.emoji, func.count(Reaction.id).label("count"))
        .where(Reaction.message_id == data.message_id)
        .group_by(Reaction.emoji)
    )
    counts = {row.emoji: row.count for row in counts_result}

    await manager.broadcast(data.channel_id, {
        "type": "reaction_update",
        "message_id": data.message_id,
        "reactions": counts,
    })

    return {"action": action, "reactions": counts}


@router.get("/{message_id}")
async def get_reactions(message_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Reaction.emoji, func.count(Reaction.id).label("count"))
        .where(Reaction.message_id == message_id)
        .group_by(Reaction.emoji)
    )
    return {row.emoji: row.count for row in result}
