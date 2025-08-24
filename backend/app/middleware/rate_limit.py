from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
from collections import defaultdict
import threading

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
        self.lock = threading.Lock()
    
    async def dispatch(self, request: Request, call_next):
        public_endpoints = [
            "/health", 
            "/health/db",
            "/api/v1/auth/login", 
            "/api/v1/auth/register", 
            "/docs", 
            "/openapi.json",
            "/redoc"
        ]
        
        if request.url.path in public_endpoints:
            return await call_next(request)
        
        client_ip = request.client.host
        current_time = time.time()
        
        with self.lock:
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if current_time - req_time < 60
            ]
            
            if len(self.requests[client_ip]) >= self.requests_per_minute:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded"}
                )
            
            self.requests[client_ip].append(current_time)
        
        response = await call_next(request)
        return response