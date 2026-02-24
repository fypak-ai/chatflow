from app.core.config import settings
from app.ai.openai_client import openai_chat
from app.ai.ollama_client import ollama_chat


async def ai_chat(messages: list, model: str = None) -> str:
    """Route to the right AI backend based on model name."""
    model = model or settings.DEFAULT_AI_MODEL

    if model.startswith("ollama:"):
        return await ollama_chat(messages, model=model.replace("ollama:", ""))
    elif model.startswith("claude"):
        from app.ai.anthropic_client import anthropic_chat
        return await anthropic_chat(messages, model=model)
    else:
        return await openai_chat(messages, model=model)
