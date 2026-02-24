from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, workspaces, channels, messages, users
from app.api import reactions, upload, dm, threads
from app.ws.manager import ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs("/app/uploads", exist_ok=True)
    yield


app = FastAPI(
    title="ChatFlow API",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(workspaces.router, prefix="/api/workspaces", tags=["workspaces"])
app.include_router(channels.router, prefix="/api/channels", tags=["channels"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(reactions.router, prefix="/api/reactions", tags=["reactions"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(dm.router, prefix="/api/dm", tags=["dm"])
app.include_router(threads.router, prefix="/api/threads", tags=["threads"])

# WebSocket
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.2.0"}
