from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool
from .config import settings

is_sqlite = settings.database_url.startswith("sqlite")

engine_kwargs = {"echo": settings.debug}
if is_sqlite:
    engine_kwargs.update({
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool
    })

engine = create_async_engine(settings.database_url, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
