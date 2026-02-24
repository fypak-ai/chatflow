import hashlib
import hmac
import httpx
from fastapi import FastAPI, Request, HTTPException, Header
from typing import Optional
import os

from app.bots.github_bot import format_push_event, format_pr_event

app = FastAPI(title="GitHub Webhook Bot")

WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")


def verify_signature(payload: bytes, signature: str) -> bool:
    if not WEBHOOK_SECRET:
        return True
    mac = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256)
    expected = f"sha256={mac.hexdigest()}"
    return hmac.compare_digest(expected, signature)


@app.post("/webhook/{channel_id}")
async def github_webhook(
    channel_id: str,
    request: Request,
    x_github_event: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None),
):
    body = await request.body()
    if x_hub_signature_256 and not verify_signature(body, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    message = None

    if x_github_event == "push":
        message = format_push_event(payload)
    elif x_github_event == "pull_request":
        message = format_pr_event(payload)

    if message:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{BACKEND_URL}/api/messages/bot",
                json={"channel_id": channel_id, "content": message, "type": "bot"},
            )

    return {"ok": True}
