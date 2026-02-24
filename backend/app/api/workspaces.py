from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from sqlalchemy import select
import re

from app.core.database import get_db
from app.models.workspace import Workspace

router = APIRouter()


class WorkspaceCreate(BaseModel):
    name: str


@router.post("/")
async def create_workspace(data: WorkspaceCreate, db: AsyncSession = Depends(get_db)):
    slug = re.sub(r"[^a-z0-9-]", "-", data.name.lower())
    workspace = Workspace(name=data.name, slug=slug, owner_id="system")  # TODO: JWT
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    return workspace


@router.get("/")
async def list_workspaces(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workspace))
    return result.scalars().all()
