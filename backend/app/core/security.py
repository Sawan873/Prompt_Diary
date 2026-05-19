"""
Security utilities for Supabase JWT verification.

Supabase issues JWTs when users sign in. The backend verifies these tokens
to authenticate API requests — it does NOT issue its own tokens.
"""

from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

# Bearer token extractor
security_scheme = HTTPBearer(auto_error=False)


def verify_supabase_token(token: str) -> Optional[dict]:
    """
    Verify and decode a Supabase JWT access token.

    Supabase JWTs are signed with the JWT_SECRET from your project settings.
    The 'sub' field contains the user's UUID (auth.users.id).

    Note: Some Supabase projects omit the 'aud' claim — we try with audience
    first and fall back to decoding without it so both formats are supported.
    """
    # First attempt: strict verification with audience claim
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience="authenticated",
        )
        return payload
    except JWTError:
        pass

    # Second attempt: decode without audience (some Supabase project configs)
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False},
        )
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> dict:
    """
    FastAPI dependency — extracts and verifies the Supabase JWT from the
    Authorization header. Returns the decoded payload with user info.

    Usage in endpoints:
        @router.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            user_id = user["sub"]  # UUID from auth.users
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated — provide a Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_supabase_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Optional[dict]:
    """
    FastAPI dependency — same as get_current_user but returns None
    instead of raising an error. Use for routes that work for both
    authenticated and unauthenticated users.
    """
    if not credentials:
        return None

    return verify_supabase_token(credentials.credentials)


async def get_current_admin(
    user: dict = Depends(get_current_user),
) -> dict:
    """
    FastAPI dependency — extracts the user JWT and queries Supabase database
    to verify that the user profile has is_admin set to True.
    """
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token — no user ID claim",
        )

    # Import inside to prevent circular import issues
    from app.core.supabase_client import get_supabase_admin
    supabase = get_supabase_admin()

    try:
        result = (
            supabase.table("profiles")
            .select("is_admin")
            .eq("id", user_id)
            .execute()
        )
        profile_data = result.data
        if profile_data and len(profile_data) > 0 and profile_data[0].get("is_admin") is True:
            return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during administrator authorization check: {str(e)}",
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied — Administrator privileges required",
    )
