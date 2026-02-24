from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.channel import Channel, ChannelMember
from sqlalchemy import select

router = APIRouter()


class ChannelCreate(BaseModel):
    workspace_id: str
    name: str
    description: Optional[str] = None
    type: str = "public"


@router.post("/")
async def create_channel(data: ChannelCreate, db: AsyncSession = Depends(get_db)):
    channel = Channel(**data.dict(), created_by="system")  # TODO: get from JWT
    db.add(channel)
    await db.commit()
    await db.refresh(channel)
    return channel


@router.get("/workspace/{workspace_id}")
async def list_channels(workspace_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Channel).where(Channel.workspace_id == workspace_id))
    return result.scalars().all()
