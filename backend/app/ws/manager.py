from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

ws_router = APIRouter()


class ConnectionManager:
    def __init__(self):
        # channel_id -> list of websockets
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, channel_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(channel_id, []).append(ws)

    def disconnect(self, channel_id: str, ws: WebSocket):
        if channel_id in self.active:
            self.active[channel_id].remove(ws)

    async def broadcast(self, channel_id: str, data: dict):
        for ws in self.active.get(channel_id, []):
            try:
                await ws.send_json(data)
            except Exception:
                pass


manager = ConnectionManager()


@ws_router.websocket("/ws/{channel_id}")
async def websocket_endpoint(channel_id: str, ws: WebSocket):
    await manager.connect(channel_id, ws)
    try:
        while True:
            data = await ws.receive_text()
            payload = json.loads(data)
            # Broadcast to everyone in the channel
            await manager.broadcast(channel_id, payload)
    except WebSocketDisconnect:
        manager.disconnect(channel_id, ws)
