## Бэкенд разработчику: руководство и учебник

Это практичный гайд по текущему бэкенду (FastAPI + SQLAlchemy + PostgreSQL) и чек-лист того, что нужно доделать. Он задуман как «учебник разработчика»: с примерами кода, командами и пояснениями.

### Технологии
- FastAPI, Pydantic
- SQLAlchemy ORM, Alembic
- PostgreSQL
- JWT (jose), bcrypt (passlib)
- Docker/Docker Compose (опционально)

## 🏗️ Архитектура приложений

### Многослойная архитектура (Layered Architecture)

Современные веб-приложения строятся по принципу разделения ответственности:

```
┌─────────────────────────────────────┐
│           Presentation Layer        │ ← API Endpoints, Controllers
├─────────────────────────────────────┤
│           Business Logic Layer      │ ← Services, Use Cases
├─────────────────────────────────────┤
│           Data Access Layer         │ ← Repositories, CRUD
├─────────────────────────────────────┤
│           Infrastructure Layer      │ ← Database, External APIs
└─────────────────────────────────────┘
```

**Принципы:**
- **Single Responsibility**: каждый слой отвечает за одну задачу
- **Dependency Inversion**: верхние слои не зависят от нижних
- **Separation of Concerns**: бизнес-логика отделена от инфраструктуры

### Паттерны проектирования

#### 1. Repository Pattern
```python
# backend/app/repositories/base.py
from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session
from app.db.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    def get(self, db: Session, id: str) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, db: Session, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, db_obj: ModelType, obj_in: dict) -> ModelType:
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, id: str) -> ModelType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
```

#### 2. Service Layer Pattern
```python
# backend/app/services/test_service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.test_repository import TestRepository
from app.schemas.test import TestCreate, TestUpdate
from app.db.models.test import Test
from app.exceptions import NotFoundException, ValidationException

class TestService:
    def __init__(self, test_repo: TestRepository):
        self.test_repo = test_repo
    
    def create_test(self, db: Session, test_data: TestCreate) -> Test:
        """Создание теста с бизнес-логикой"""
        # Валидация бизнес-правил
        if len(test_data.questions) == 0:
            raise ValidationException("Тест должен содержать хотя бы один вопрос")
        
        if test_data.duration <= 0:
            raise ValidationException("Длительность теста должна быть положительной")
        
        # Создание через репозиторий
        return self.test_repo.create_test_with_questions(db, test_data)
    
    def get_test_by_id(self, db: Session, test_id: str) -> Test:
        """Получение теста с проверкой существования"""
        test = self.test_repo.get(db, test_id)
        if not test:
            raise NotFoundException(f"Тест с ID {test_id} не найден")
        return test
    
    def get_active_tests(self, db: Session, skip: int = 0, limit: int = 10) -> List[Test]:
        """Получение только активных тестов"""
        return self.test_repo.get_active_tests(db, skip, limit)
    
    def update_test(self, db: Session, test_id: str, test_data: TestUpdate) -> Test:
        """Обновление теста с валидацией"""
        existing_test = self.get_test_by_id(db, test_id)
        return self.test_repo.update(db, existing_test, test_data.dict(exclude_unset=True))
```

#### 3. Dependency Injection Pattern
```python
# backend/app/dependencies.py
from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.test_repository import TestRepository
from app.services.test_service import TestService

def get_test_repository() -> TestRepository:
    return TestRepository()

def get_test_service(
    test_repo: TestRepository = Depends(get_test_repository)
) -> TestService:
    return TestService(test_repo)

# Использование в контроллерах:
@router.post("/tests", response_model=TestCreate)
def create_test(
    test_data: TestCreate,
    db: Session = Depends(get_db),
    test_service: TestService = Depends(get_test_service)
):
    return test_service.create_test(db, test_data)
```

### Middleware и Interceptors

#### 1. Authentication Middleware
```python
# backend/app/middleware/auth_middleware.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.auth import get_current_user_from_token
import time

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Пропускаем публичные эндпоинты
        if request.url.path in ["/api/v1/auth/login", "/api/v1/auth/register", "/docs"]:
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
            user = await get_current_user_from_token(token)
            request.state.user = user
        except Exception as e:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token"}
            )
        
        return await call_next(request)
```

#### 2. Logging Middleware
```python
# backend/app/middleware/logging_middleware.py
import logging
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Логируем входящий запрос
        logger.info(f"Request: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        # Логируем время выполнения
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} - {process_time:.4f}s")
        
        return response
```

#### 3. Rate Limiting Middleware
```python
# backend/app/middleware/rate_limit_middleware.py
from fastapi import Request, HTTPException
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
        client_ip = request.client.host
        current_time = time.time()
        
        with self.lock:
            # Очищаем старые запросы
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if current_time - req_time < 60
            ]
            
            # Проверяем лимит
            if len(self.requests[client_ip]) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded"
                )
            
            # Добавляем текущий запрос
            self.requests[client_ip].append(current_time)
        
        return await call_next(request)
```

### Error Handling

#### 1. Custom Exceptions
```python
# backend/app/exceptions.py
from fastapi import HTTPException

class NotFoundException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=404, detail=detail)

class ValidationException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail)

class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail)

class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=403, detail=detail)
```

#### 2. Global Exception Handler
```python
# backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.exceptions import NotFoundException, ValidationException
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )
```

### Configuration Management

#### 1. Environment-based Configuration
```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "3891123"
    POSTGRES_DB: str = "medical_application"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Medical Tests API"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

#### 2. Database Configuration
```python
# backend/app/db/config.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def get_database_url() -> str:
    if settings.DATABASE_URL:
        return settings.DATABASE_URL
    return f"postgresql+psycopg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"

engine = create_engine(
    get_database_url(),
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### Validation and Serialization

#### 1. Pydantic Models with Validation
```python
# backend/app/schemas/test.py
from pydantic import BaseModel, validator, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class QuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=1, max_length=1000)
    options: Optional[List[str]] = None
    correct_answers: Optional[List[int]] = None
    question_type: str = Field(..., regex="^(single_choice|multiple_choice|open_ended)$")
    
    @validator('options')
    def validate_options(cls, v, values):
        if values.get('question_type') in ['single_choice', 'multiple_choice']:
            if not v:
                raise ValueError('Options are required for choice questions')
            if len(v) < 2:
                raise ValueError('At least 2 options are required')
        return v
    
    @validator('correct_answers')
    def validate_correct_answers(cls, v, values):
        if v and values.get('options'):
            max_index = len(values['options']) - 1
            for answer in v:
                if answer < 0 or answer > max_index:
                    raise ValueError(f'Invalid answer index: {answer}')
        return v

class TestCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    duration: int = Field(..., gt=0, le=480)  # 0-8 hours
    questions: List[QuestionCreate] = Field(..., min_items=1, max_items=100)
    
    @validator('questions')
    def validate_questions(cls, v):
        if len(v) == 0:
            raise ValueError('Test must have at least one question')
        return v
```

### Testing Strategies

#### 1. Unit Tests
```python
# backend/tests/unit/test_test_service.py
import pytest
from unittest.mock import Mock, patch
from app.services.test_service import TestService
from app.schemas.test import TestCreate, QuestionCreate
from app.exceptions import ValidationException, NotFoundException

class TestTestService:
    def setup_method(self):
        self.mock_repo = Mock()
        self.service = TestService(self.mock_repo)
    
    def test_create_test_success(self):
        # Arrange
        test_data = TestCreate(
            title="Test Title",
            duration=30,
            questions=[
                QuestionCreate(
                    question_text="Test question?",
                    options=["A", "B", "C"],
                    correct_answers=[0],
                    question_type="single_choice"
                )
            ]
        )
        self.mock_repo.create_test_with_questions.return_value = Mock()
        
        # Act
        result = self.service.create_test(Mock(), test_data)
        
        # Assert
        assert result is not None
        self.mock_repo.create_test_with_questions.assert_called_once()
    
    def test_create_test_no_questions(self):
        # Arrange
        test_data = TestCreate(
            title="Test Title",
            duration=30,
            questions=[]
        )
        
        # Act & Assert
        with pytest.raises(ValidationException, match="Тест должен содержать хотя бы один вопрос"):
            self.service.create_test(Mock(), test_data)
```

#### 2. Integration Tests
```python
# backend/tests/integration/test_api.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.models.base import Base
from app.core.config import settings

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

def test_create_test(client):
    response = client.post(
        "/api/v1/tests",
        json={
            "title": "Test Title",
            "duration": 30,
            "questions": [
                {
                    "question_text": "Test question?",
                    "options": ["A", "B", "C"],
                    "correct_answers": [0],
                    "question_type": "single_choice"
                }
            ]
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Title"
```

### Performance Optimization

#### 1. Database Query Optimization
```python
# backend/app/repositories/test_repository.py
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy import and_, or_

class TestRepository(BaseRepository[Test]):
    def get_test_with_questions(self, db: Session, test_id: str) -> Optional[Test]:
        """Получение теста с вопросами одним запросом"""
        return (
            db.query(Test)
            .options(selectinload(Test.questions))
            .filter(Test.id == test_id)
            .first()
        )
    
    def get_tests_with_stats(self, db: Session, skip: int = 0, limit: int = 10):
        """Получение тестов со статистикой"""
        return (
            db.query(Test)
            .options(
                selectinload(Test.questions),
                selectinload(Test.attempts)
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
```

#### 2. Caching Strategy
```python
# backend/app/core/cache.py
import redis
import json
from typing import Optional, Any
from app.core.config import settings

class CacheManager:
    def __init__(self):
        self.redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
    
    def get(self, key: str) -> Optional[Any]:
        value = self.redis.get(key)
        return json.loads(value) if value else None
    
    def set(self, key: str, value: Any, expire: int = 3600):
        self.redis.setex(key, expire, json.dumps(value))
    
    def delete(self, key: str):
        self.redis.delete(key)
    
    def invalidate_pattern(self, pattern: str):
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys)

cache = CacheManager()
```

### Security Best Practices

#### 1. Input Sanitization
```python
# backend/app/core/security.py
import re
from html import escape

def sanitize_input(text: str) -> str:
    """Очистка пользовательского ввода"""
    # Удаляем HTML теги
    text = re.sub(r'<[^>]+>', '', text)
    # Экранируем специальные символы
    text = escape(text)
    return text.strip()

def validate_email(email: str) -> bool:
    """Валидация email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
```

#### 2. Password Policy
```python
# backend/app/core/auth.py
import re
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_password_strength(password: str) -> bool:
    """Проверка сложности пароля"""
    if len(password) < 8:
        return False
    
    # Должен содержать хотя бы одну букву и цифру
    if not re.search(r'[A-Za-z]', password):
        return False
    
    if not re.search(r'\d', password):
        return False
    
    # Должен содержать хотя бы один специальный символ
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    
    return True

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    if not validate_password_strength(password):
        raise ValueError("Password does not meet security requirements")
    return pwd_context.hash(password)
```

### Monitoring and Logging

#### 1. Structured Logging
```python
# backend/app/core/logging.py
import logging
import json
from datetime import datetime
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        
        return json.dumps(log_entry)

def setup_logging():
    logger = logging.getLogger()
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
```

#### 2. Health Checks
```python
# backend/app/api/endpoints/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.cache import cache
import time

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    checks = {
        "database": "unknown",
        "cache": "unknown",
        "overall": "unknown"
    }
    
    # Проверка базы данных
    try:
        db.execute("SELECT 1")
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
    
    # Проверка кеша
    try:
        cache.set("health_check", "ok", 10)
        if cache.get("health_check") == "ok":
            checks["cache"] = "healthy"
        else:
            checks["cache"] = "unhealthy"
    except Exception as e:
        checks["cache"] = f"unhealthy: {str(e)}"
    
    # Общий статус
    if all(status == "healthy" for status in checks.values()):
        checks["overall"] = "healthy"
    else:
        checks["overall"] = "unhealthy"
    
    return checks
```

### Быстрый старт
1) Установи зависимости:
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```
2) Заполни переменные окружения (создай файл `.env` на основе `backend/.env.example`).
3) Прогони миграции и подними API:
```
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Проверка Docs: открой `http://localhost:8000/docs`.

### Конфигурация и окружение
- Файл `backend/app/core/config.py` формирует строку подключения к БД из env.
- Создай `backend/.env` (см. `backend/.env.example`). Пример:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medical_application
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SECRET_KEY=dev-secret-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Проверка подключения к БД:
```python
# backend/app/db/session.py (фрагмент)
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("SELECT 1"))
```

### Архитектура бэкенда
- Точка входа: `backend/app/main.py`
  - CORS: `http://localhost:3000`
  - Роуты: `/api/v1/auth/*`, `/api/v1/tests*`
- Модели (`backend/app/db/models/`):
  - `User`: `id: UUID`, `email`, `hashed_password`, `is_active`, `created_at`
  - `Test`: `id: UUID`, `title`, `description`, `duration`, `created_at`
  - `Question`: `id: UUID`, `test_id`, `question_text`, `options: JSON`, `correct_answers: JSON`, `question_type`
- Схемы (`backend/app/schemas/test.py`): `TestCreate`, `QuestionCreate`, обновления.
- CRUD (`backend/app/db/crud/crud.py`): создание, получение, обновление, удаление тестов, валидации.
- Аутентификация (`backend/app/core/auth.py`): JWT, хеширование пароля, guard'ы.

Рекомендованная "service"-прослойка для бизнес-логики:
```python
# backend/app/services/test_service.py
from sqlalchemy.orm import Session
from app.db.models.test import Test
from app.db.models.questions import Question
from app.schemas.test import TestCreate

def create_test_with_questions(db: Session, payload: TestCreate) -> Test:
    test = Test(title=payload.title, description=payload.description, duration=payload.duration)
    db.add(test)
    db.flush()
    for q in payload.questions:
        db.add(Question(
            test_id=test.id,
            question_text=q.question_text,
            options=q.options,
            correct_answers=q.correct_answers,
            question_type=q.question_type,
        ))
    db.commit()
    db.refresh(test)
    return test
```

### Эндпоинты аутентификации
- POST `/api/v1/auth/register` — регистрация
- POST `/api/v1/auth/token` — OAuth2 (form-data: username, password)
- POST `/api/v1/auth/login` — JSON вход `{ email, password }`
- GET `/api/v1/auth/me` — профиль текущего пользователя по Bearer токену

Примеры:
```bash
# Регистрация
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"StrongP@ssw0rd"}'

# Логин JSON
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"StrongP@ssw0rd"}'

# Профиль
curl http://localhost:8000/api/v1/auth/me \
  -H 'Authorization: Bearer <token>'
```

Прямой OAuth2 Password flow для Swagger:
```python
# backend/app/core/auth.py (фрагмент)
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")
```

### Эндпоинты тестов
- GET `/api/v1/tests?skip=0&limit=10`
- POST `/api/v1/tests`
- GET `/api/v1/tests/{test_id}`
- PUT `/api/v1/tests/{test_id}`
- DELETE `/api/v1/tests/{test_id}`
- DELETE `/api/v1/tests/` (очистить все)

Пример payload для создания/обновления теста:
```json
{
  "title": "Neuro exam v1",
  "description": "Basics of neuro diagnostics",
  "duration": 30,
  "questions": [
    {
      "question_text": "Choose correct statements",
      "options": ["A", "B", "C", "D"],
      "correct_answers": [1, 3],
      "question_type": "multiple_choice"
    },
    {
      "question_text": "Explain reflex arc",
      "question_type": "open_ended"
    }
  ]
}
```

Пример запроса:
```bash
curl -X POST http://localhost:8000/api/v1/tests \
  -H 'Content-Type: application/json' \
  -d @test_payload.json
```

Валидация индексов правильных ответов есть в CRUD. Для открытых вопросов `options` должны быть `null`.

### Интеграция с фронтендом
- Фронту нужен общий `API_BASE_URL`, у нас это `http://localhost:8000/api/v1`.
- Убедись, что все клиентские вызовы используют префикс `/api/v1`.
- CORS настроен в `app/main.py`. Если порт фронта другой — добавь в `allow_origins`.

Пример запроса с Bearer из фронта:
```ts
const token = (session as any)?.accessToken
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tests`, {
  headers: { Authorization: `Bearer ${token}` }
})
```

### Тестирование
- Юнит-тесты для auth и CRUD — добавить в `backend/tests/`.
- Пример: авторизация, создание теста, пагинация, обновление, удаление.

Шаблон теста с pytest:
```python
# backend/tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    r = client.post('/api/v1/auth/register', json={
        'email': 'test@example.com',
        'password': 'StrongP@ssw0rd'
    })
    assert r.status_code in (200, 400)  # повторный запуск допускает 400

    r = client.post('/api/v1/auth/login', json={
        'email': 'test@example.com',
        'password': 'StrongP@ssw0rd'
    })
    assert r.status_code == 200
    assert 'access_token' in r.json()
```

### Производственные аспекты и безопасность
- Секреты из env, не коммитить `.env`.
- Пароли — только хеши (bcrypt).
- Пересмотреть `OAuth2PasswordBearer(tokenUrl="token")` и задать полный путь для интерактива в docs: `tokenUrl="/api/v1/auth/token"`.
- Лимит запросов и защита от брутфорса (NGINX/Traefik + fail2ban/redis-rate-limit) — TODO.
- Валидация входных данных (Pydantic) уже есть для тестов, расширить для auth — TODO.

Сеансы БД и транзакции:
```python
from contextlib import contextmanager
from app.db.session import SessionLocal

@contextmanager
def get_tx():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()
```

### Дорожная карта (backend TODO)
- [ ] Роли и права (admin/author/user)
- [ ] Статистика по попыткам прохождения тестов (отдельные таблицы Attempts/Answers)
- [ ] Версионирование тестов и черновики
- [ ] Поиск/фильтр/сортировка тестов, курсорная пагинация
- [ ] Единый формат ошибок и логирование в файл/ELK
- [ ] CI: прогон тестов, линт, миграции
- [ ] Документация OpenAPI: описать схемы и примеры

Дополнительно:
- [ ] Сгенерировать клиент по OpenAPI (orjson + fastapi-codegen) и использовать во фронте
- [ ] Добавить Alembic автоген, пример миграции роли:
  ```python
  # alembic revision -m "add_user_role"
  from alembic import op
  import sqlalchemy as sa

  def upgrade():
      op.add_column('users', sa.Column('role', sa.String(length=32), nullable=True))

  def downgrade():
      op.drop_column('users', 'role')
  ```

### Искусство читаемого кода (практика)
- Имена переменных и функций — полные и смысловые.
- Ранние возвраты, обработка краёв, без глубоких вложенностей.
- Логи на уровнях info/debug/error, без лишней болтовни.

### Шаблон сервиса (пример)
```python
from sqlalchemy.orm import Session
from app.db.models.test import Test

def find_tests_by_title(db: Session, title_query: str, limit: int = 20):
    return (
        db.query(Test)
        .filter(Test.title.ilike(f"%{title_query}%"))
        .order_by(Test.created_at.desc())
        .limit(limit)
        .all()
    )
```

### Полный пример контроллера с сервисом и схемами
```python
# backend/app/api/endpoints/search.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.test import TestCreate
from app.services.test_service import find_tests_by_title

router = APIRouter()

@router.get('/tests/search', response_model=list[TestCreate])
def search_tests(q: str, db: Session = Depends(get_db)):
    if not q:
        raise HTTPException(status_code=400, detail='query is required')
    return find_tests_by_title(db, q)
```

Если что-то не сходится с текущей реализацией — закрепляй новое поведение тестами и вноси правки последовательно.


