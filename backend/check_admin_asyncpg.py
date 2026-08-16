import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    
    # Connect with prepared_statement_cache_size=0 for pgbouncer
    conn = await asyncpg.connect(url, statement_cache_size=0)
    
    try:
        row = await conn.fetchrow("SELECT email, hashed_password, deleted_at FROM users WHERE email = 'admin@example.com'")
        if row:
            print(f"Admin found! Hash: {row['hashed_password']}")
            print(f"Deleted at: {row['deleted_at']}")
        else:
            print("Admin NOT found!")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
