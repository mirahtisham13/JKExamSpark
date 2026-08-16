import asyncio
import httpx

async def try_login():
    url = "https://jkexamspark-backend.onrender.com/api/v1/auth/login"
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=login_data)
        print("Login Status:", res.status_code)
        print("Response:", res.text)

if __name__ == "__main__":
    asyncio.run(try_login())
