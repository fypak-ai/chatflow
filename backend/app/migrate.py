"""Run DB migrations on deploy (Railway release phase)."""
import asyncio
from app.core.database import init_db


async def main():
    print("Running DB migrations...")
    await init_db()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
