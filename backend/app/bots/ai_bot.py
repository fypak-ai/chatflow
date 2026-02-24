"""AI Bot — responds when message starts with @ai"""
from app.ai.router import ai_chat


async def handle_ai_mention(content: str, history: list) -> str:
    """Process @ai mention and return AI response."""
    # Strip @ai prefix
    prompt = content.replace("@ai", "", 1).strip()

    messages = history[-10:]  # last 10 messages as context
    messages.append({"role": "user", "content": prompt})

    return await ai_chat(messages)
