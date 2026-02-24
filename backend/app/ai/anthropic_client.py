import anthropic
from app.core.config import settings

client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


async def anthropic_chat(messages: list, model: str = "claude-3-5-sonnet-20241022") -> str:
    # Convert OpenAI format to Anthropic format
    system = next((m["content"] for m in messages if m["role"] == "system"), None)
    user_msgs = [m for m in messages if m["role"] != "system"]

    response = await client.messages.create(
        model=model,
        max_tokens=4096,
        system=system,
        messages=user_msgs,
    )
    return response.content[0].text
