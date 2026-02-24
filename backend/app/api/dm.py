from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.channel import Channel, ChannelMember
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter()


class DMOpen(BaseModel):
    target_user_id: str
    workspace_id: str


@router.post("/open")
async def open_dm(
    data: DMOpen,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Open (or reuse) a DM channel between current user and target."""
    # Check target exists
    target = await db.execute(select(User).where(User.id == data.target_user_id))
    if not target.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Look for existing DM channel both users share
    # DM channels have type='dm' and exactly 2 members
    my_dms = select(ChannelMember.channel_id).where(ChannelMember.user_id == current_user.id)
    their_dms = select(ChannelMember.channel_id).where(ChannelMember.user_id == data.target_user_id)

    existing = await db.execute(
        select(Channel)
        .where(
            Channel.type == "dm",
            Channel.workspace_id == data.workspace_id,
            Channel.id.in_(my_dms),
            Channel.id.in_(their_dms),
        )
        .limit(1)
    )
    channel = existing.scalar_one_or_none()

    if channel:
        return channel

    # Create new DM channel
    dm_name = f"dm-{min(current_user.id, data.target_user_id)[:4]}-{max(current_user.id, data.target_user_id)[:4]}"
    channel = Channel(
        workspace_id=data.workspace_id,
        name=dm_name,
        type="dm",
        created_by=current_user.id,
    )
    db.add(channel)
    await db.flush()

    db.add(ChannelMember(channel_id=channel.id, user_id=current_user.id))
    db.add(ChannelMember(channel_id=channel.id, user_id=data.target_user_id))
    await db.commit()
    await db.refresh(channel)
    return channel


@router.get("/workspace/{workspace_id}")
async def list_dms(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all DM channels for current user in workspace."""
    my_channels = select(ChannelMember.channel_id).where(ChannelMember.user_id == current_user.id)
    result = await db.execute(
        select(Channel)
        .where(
            Channel.workspace_id == workspace_id,
            Channel.type == "dm",
            Channel.id.in_(my_channels),
        )
    )
    return result.scalars().all()
