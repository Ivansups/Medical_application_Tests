from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.auth import get_current_user_from_token
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Пропускаем публичные эндпоинты
        public_endpoints = [
            "/api/v1/auth/login", 
            "/api/v1/auth/register", 
            "/api/v1/auth/token",
            "/api/v1/auth/token/json",
            "/docs", 
            "/openapi.json",
            "/redoc",
            "/health",
            "/health/db"
        ]
        
        if request.url.path in public_endpoints:
            return await call_next(request)
        
        # Проверяем токен
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid authorization header"}
            )
        
        try:
            token = auth_header.split(" ")[1]
            from app.db.session import SessionLocal
            with SessionLocal() as db:
                user = get_current_user_from_token(token, db)
            request.state.user = user
            logger.info(f"Authenticated user: {user.email}")
        except Exception as e:
            logger.warning(f"Authentication failed: {str(e)}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token"}
            )
        
        response = await call_next(request)
        return response