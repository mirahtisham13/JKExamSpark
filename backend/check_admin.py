import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def check_admin():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT email, hashed_password FROM users WHERE email = 'admin@example.com'"))
        row = res.fetchone()
        if row:
            print(f"Admin found! Hash: {row[1]}")
        else:
            print("Admin NOT found!")

if __name__ == "__main__":
    asyncio.run(check_admin())
