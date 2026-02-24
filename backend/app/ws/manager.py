from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio

from app.core.security import ws_authenticate
from app.core.redis import redis_client

ws_router = APIRouter()


class ConnectionManager:
    def __init__(self):
        # channel_id -> {user_id: websocket}
        self.active: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, channel_id: str, user_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(channel_id, {})[user_id] = ws
        # Publish presence event
        await redis_client.publish(
            f"channel:{channel_id}",
            json.dumps({"type": "presence", "user_id": user_id, "status": "online"}),
        )

    async def disconnect(self, channel_id: str, user_id: str):
        if channel_id in self.active:
            self.active[channel_id].pop(user_id, None)
        await redis_client.publish(
            f"channel:{channel_id}",
            json.dumps({"type": "presence", "user_id": user_id, "status": "offline"}),
        )

    async def broadcast(self, channel_id: str, data: dict, exclude_user: str | None = None):
        dead = []
        for uid, ws in self.active.get(channel_id, {}).items():
            if uid == exclude_user:
                continue
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(uid)
        for uid in dead:
            self.active[channel_id].pop(uid, None)

    def online_users(self, channel_id: str) -> list:
        return list(self.active.get(channel_id, {}).keys())


manager = ConnectionManager()


@ws_router.websocket("/ws/{channel_id}")
async def websocket_endpoint(channel_id: str, ws: WebSocket):
    user_id = await ws_authenticate(ws)
    if not user_id:
        return

    await manager.connect(channel_id, user_id, ws)

    # Send current online users list
    await ws.send_json({
        "type": "init",
        "online_users": manager.online_users(channel_id),
    })

    try:
        while True:
            data = await ws.receive_text()
            payload = json.loads(data)
            payload["user_id"] = user_id  # always inject real user_id

            # Handle typing indicator (don't persist)
            if payload.get("type") == "typing":
                await manager.broadcast(channel_id, payload, exclude_user=user_id)
                continue

            # Broadcast message to everyone
            await manager.broadcast(channel_id, payload)
    except WebSocketDisconnect:
        await manager.disconnect(channel_id, user_id)
        await manager.broadcast(channel_id, {
            "type": "presence",
            "user_id": user_id,
            "status": "offline",
        })
