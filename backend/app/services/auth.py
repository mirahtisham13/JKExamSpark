from datetime import timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user import User, UserRole
from ..models.refresh_token import RefreshToken
from ..core.security import (verify_password, get_password_hash,
                              create_access_token, create_refresh_token, decode_access_token)
from ..core.exceptions import ConflictException, CredentialsException
from ..schemas.auth import RegisterRequest, TokenResponse
from ..schemas.user import UserPublic
from ..config import settings


async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    """Register a new student. Role always defaults to student regardless of input."""
    # Check email uniqueness
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise ConflictException("Email address is already registered")

    # Check username uniqueness
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise ConflictException("Username is already taken")

    user = User(
        email=data.email,
        username=data.username.lower(),
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=UserRole.student,  # Always student — admins created via seed or direct DB
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


async def create_tokens(db: AsyncSession, user: User) -> TokenResponse:
    """Create access + refresh token pair and store refresh token in DB."""
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh_token_str = create_refresh_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)

    token_record = RefreshToken(
        token=refresh_token_str,
        user_id=user.id,
        expires_at=expires_at,
        is_revoked=False,
    )
    db.add(token_record)

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.add(user)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        user=UserPublic.model_validate(user),
    )


async def refresh_access_token(db: AsyncSession, refresh_token_str: str) -> TokenResponse:
    """Validate refresh token, issue new access token."""
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token == refresh_token_str,
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
    )
    token_record = result.scalar_one_or_none()
    if not token_record:
        raise CredentialsException("Invalid or expired refresh token")

    # Fetch user
    result = await db.execute(
        select(User).where(User.id == token_record.user_id, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise CredentialsException("User not found or inactive")

    # Revoke old token and issue new pair
    token_record.is_revoked = True
    db.add(token_record)

    return await create_tokens(db, user)


async def revoke_refresh_token(db: AsyncSession, refresh_token_str: str) -> None:
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token == refresh_token_str)
    )
    token_record = result.scalar_one_or_none()
    if token_record:
        token_record.is_revoked = True
        db.add(token_record)
        await db.commit()


async def seed_admin_if_needed(db: AsyncSession) -> None:
    """Create first admin user on startup if no admin exists."""
    result = await db.execute(select(User).where(User.role == UserRole.admin))
    if result.scalar_one_or_none():
        return  # Admin already exists

    admin = User(
        email=settings.first_admin_email,
        username="admin",
        hashed_password=get_password_hash(settings.first_admin_password),
        full_name=settings.first_admin_full_name,
        role=UserRole.admin,
        is_active=True,
        is_verified=True,
    )
    db.add(admin)
    await db.commit()
    print(f"[STARTUP] Created first admin user: {settings.first_admin_email}")
