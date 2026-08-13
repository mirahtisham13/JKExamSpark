from typing import Optional, AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .database import get_db
from .models.user import User, UserRole
from .core.security import decode_access_token
from .core.exceptions import CredentialsException, ForbiddenException

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise CredentialsException("Authentication required")

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise CredentialsException("Invalid or expired access token")

    user_id = payload.get("sub")
    if not user_id:
        raise CredentialsException("Invalid token payload")

    result = await db.execute(
        select(User).where(User.id == int(user_id), User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise CredentialsException("User not found")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    return current_user


async def require_student(
    current_user: User = Depends(get_current_active_user),
) -> User:
    # Both students and admins can access student endpoints
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if current_user.role != UserRole.admin:
        raise ForbiddenException("Admin access required")
    return current_user


async def optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Returns user if authenticated, None if not. Used for public endpoints."""
    if not credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await db.execute(
            select(User).where(User.id == int(user_id), User.is_active == True)
        )
        return result.scalar_one_or_none()
    except Exception:
        return None
