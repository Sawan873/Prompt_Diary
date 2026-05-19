"""
In-memory sliding window rate limiter for FastAPI.

Provides thread-safe global, authentication, and administrative rate limiting
without requiring external database dependencies (like Redis), making it lightweight
and highly compatible with serverless/containerized hosting.
"""

import time
import threading
from typing import Dict, List
from fastapi import Request, HTTPException, status


class RateLimiter:
    def __init__(self, requests: int, window_seconds: int, name: str = "API"):
        """
        Initialize the rate limiter.
        
        Args:
            requests: Maximum number of requests allowed in the window.
            window_seconds: Duration of the sliding window in seconds.
            name: Human-readable name of the rate limiter (e.g., 'Auth', 'Global').
        """
        self.max_requests = requests
        self.window_seconds = window_seconds
        self.name = name
        self.hits: Dict[str, List[float]] = {}
        self.lock = threading.Lock()

    def _clean_old_hits(self, client_key: str, now: float):
        """Removes hits that fall outside the current sliding window."""
        cutoff = now - self.window_seconds
        self.hits[client_key] = [t for t in self.hits[client_key] if t > cutoff]

    def check_rate_limit(self, client_key: str):
        """
        Verifies if a client key has exceeded the rate limit.
        Raises an HTTP 429 Too Many Requests if the limit is exceeded.
        """
        now = time.time()
        with self.lock:
            if client_key not in self.hits:
                self.hits[client_key] = []
            
            self._clean_old_hits(client_key, now)
            
            current_hits = len(self.hits[client_key])
            if current_hits >= self.max_requests:
                # Calculate retry-after remaining duration
                oldest_hit = self.hits[client_key][0]
                retry_after = int(self.window_seconds - (now - oldest_hit))
                # Ensure retry_after is at least 1 second
                retry_after = max(1, retry_after)
                
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Too Many Requests",
                        "message": f"Rate limit exceeded for {self.name} routes. Max {self.max_requests} requests per {self.window_seconds}s.",
                        "retry_after_seconds": retry_after
                    },
                    headers={"Retry-After": str(retry_after)}
                )
            
            self.hits[client_key].append(now)

    async def __call__(self, request: Request):
        """
        FastAPI Dependency call. 
        Resolves rate limiting key by Client IP (fallback to host).
        """
        # Resolve client key (prefer forward headers from proxies like Railway/Vercel/Cloudflare)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_key = forwarded_for.split(",")[0].strip()
        else:
            client_key = request.client.host if request.client else "unknown-ip"
            
        self.check_rate_limit(client_key)
        return client_key


# Expose standard rate limiters for the platform
# 1. Global Rate Limiter: 100 requests per minute
global_rate_limiter = RateLimiter(requests=100, window_seconds=60, name="Global")

# 2. Authentication Rate Limiter: 5 attempts per minute (stops brute-force)
auth_rate_limiter = RateLimiter(requests=5, window_seconds=60, name="Authentication")

# 3. Admin Operations Rate Limiter: 15 actions per minute
admin_rate_limiter = RateLimiter(requests=15, window_seconds=60, name="Admin CMS")
