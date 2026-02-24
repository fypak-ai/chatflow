from jose import jwt, JWTError
from fastapi import WebSocket, WebSocketDisconnect, status
from app.core.config import settings


def decode_token(token: str) -> str | None:
    """Decode JWT and return user_id or None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None


async def ws_authenticate(ws: WebSocket) -> str | None:
    """Extract and validate JWT from WebSocket query param ?token=..."""
    token = ws.query_params.get("token")
    if not token:
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        return None
    user_id = decode_token(token)
    if not user_id:
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        return None
    return user_id
