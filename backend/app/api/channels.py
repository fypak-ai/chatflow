from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
import uuid

from app.core.database import get_db
from app.models.channel import Channel, ChannelMember
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter()


class ChannelCreate(BaseModel):
    workspace_id: str
    name: str
    description: Optional[str] = None
    type: str = "public"


@router.post("/")
async def create_channel(
    data: ChannelCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    channel = Channel(
        workspace_id=data.workspace_id,
        name=data.name,
        description=data.description,
        type=data.type,
        created_by=current_user.id,
    )
    db.add(channel)
    await db.flush()
    # Auto-join creator
    member = ChannelMember(channel_id=channel.id, user_id=current_user.id)
    db.add(member)
    await db.commit()
    await db.refresh(channel)
    return channel


@router.get("/workspace/{workspace_id}")
async def list_channels(workspace_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Channel).where(Channel.workspace_id == workspace_id)
    )
    return result.scalars().all()


@router.post("/{channel_id}/join")
async def join_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(ChannelMember).where(
            ChannelMember.channel_id == channel_id,
            ChannelMember.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        return {"ok": True, "message": "Já membro"}
    member = ChannelMember(channel_id=channel_id, user_id=current_user.id)
    db.add(member)
    await db.commit()
    return {"ok": True}


@router.get("/{channel_id}/members")
async def channel_members(channel_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .join(ChannelMember, ChannelMember.user_id == User.id)
        .where(ChannelMember.channel_id == channel_id)
    )
    return result.scalars().all()
