"""
Authentication API endpoints.

POST /auth/signup    — Register a new user
POST /auth/login     — Login and get access token
"""

from fastapi import APIRouter, HTTPException
from app.schemas.user import UserSignup, UserLogin, MessageResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=MessageResponse)
async def signup(user_data: UserSignup):
    """
    Register a new user account.

    In Phase 1, this is a stub that simulates registration.
    In Phase 2+, this will integrate with Supabase Auth.
    """
    # Phase 1: Stub — just acknowledge the request
    # Phase 2: Will create user in Supabase Auth + profiles table
    return MessageResponse(
        message=f"Account created successfully for {user_data.email}. (Phase 1 stub — Supabase integration coming in Phase 2)",
        success=True,
    )


@router.post("/login", response_model=MessageResponse)
async def login(user_data: UserLogin):
    """
    Login with email and password.

    In Phase 1, this is a stub that simulates login.
    In Phase 2+, this will validate credentials via Supabase Auth and return a JWT.
    """
    # Phase 1: Stub — just acknowledge the request
    # Phase 2: Will validate against Supabase Auth and return JWT
    return MessageResponse(
        message=f"Login successful for {user_data.email}. (Phase 1 stub — Supabase integration coming in Phase 2)",
        success=True,
    )
