"""Base SDK for ChatFlow bots.

Example usage:

    from app.bots.sdk import Bot

    bot = Bot(name="MyBot")

    @bot.command("/hello")
    async def hello(args: str, channel_id: str, user_id: str) -> str:
        return f"Hello, {user_id}!"
"""
from typing import Callable, Dict


class Bot:
    def __init__(self, name: str):
        self.name = name
        self._commands: Dict[str, Callable] = {}

    def command(self, cmd: str):
        def decorator(fn: Callable):
            self._commands[cmd] = fn
            return fn
        return decorator

    async def handle(self, text: str, channel_id: str, user_id: str) -> str | None:
        parts = text.strip().split(maxsplit=1)
        if not parts:
            return None
        cmd = parts[0]
        args = parts[1] if len(parts) > 1 else ""
        handler = self._commands.get(cmd)
        if handler:
            return await handler(args=args, channel_id=channel_id, user_id=user_id)
        return None
