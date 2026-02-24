from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def openai_chat(messages: list, model: str = "gpt-4o") -> str:
    response = await client.chat.completions.create(
        model=model,
        messages=messages,
    )
    return response.choices[0].message.content
