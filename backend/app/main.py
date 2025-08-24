from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from sqlalchemy.orm import Session
from app.db import get_db
from app.api.endpoints import tests_questions, auth, search
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.auth import AuthMiddleware
from app.exceptions import NotFoundException, ValidationException, UnauthorizedException, ForbiddenException
from app.core.config import settings
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Medical Tests API", 
    version="1.1.0",
    description="API для медицинских тестов"
)

@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request: Request, exc: NotFoundException):
    logger.warning(f"Not found: {request.url.path}")
    return JSONResponse(
        status_code=404,
        content={"error": "Not found", "detail": exc.detail}
    )

@app.exception_handler(ValidationException)
async def validation_exception_handler(request: Request, exc: ValidationException):
    logger.warning(f"Validation error: {exc.detail}")
    return JSONResponse(
        status_code=400,
        content={"error": "Validation error", "detail": exc.detail}
    )

@app.exception_handler(UnauthorizedException)
async def unauthorized_exception_handler(request: Request, exc: UnauthorizedException):
    logger.warning(f"Unauthorized access: {request.url.path}")
    return JSONResponse(
        status_code=401,
        content={"error": "Unauthorized", "detail": exc.detail}
    )

@app.exception_handler(ForbiddenException)
async def forbidden_exception_handler(request: Request, exc: ForbiddenException):
    logger.warning(f"Access forbidden: {request.url.path}")
    return JSONResponse(
        status_code=403,
        content={"error": "Forbidden", "detail": exc.detail}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        swagger_js_url="/static/swagger-ui/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui/swagger-ui.css",
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)
app.add_middleware(AuthMiddleware)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(tests_questions.router, prefix="/api/v1", tags=["tests"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])

@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return {"message": "Hello, Database is connected!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    try:
        # Простая проверка подключения к БД
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Database connection failed")