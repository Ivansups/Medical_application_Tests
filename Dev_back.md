## Бэкенд разработчику: руководство и учебник

Это практичный гайд по текущему бэкенду (FastAPI + SQLAlchemy + PostgreSQL) и чек-лист того, что нужно доделать. Он задуман как «учебник разработчика»: с примерами кода, командами и пояснениями.

### Технологии
- FastAPI, Pydantic
- SQLAlchemy ORM, Alembic
- PostgreSQL
- JWT (jose), bcrypt (passlib)
- Docker/Docker Compose (опционально)

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
- Аутентификация (`backend/app/core/auth.py`): JWT, хеширование пароля, guard’ы.

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

## Полный код для завершения бэкенда

### 1. Дополнительные схемы для валидации

**Файл: `backend/app/schemas/auth.py`**
```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
```

### 2. Сервисный слой для бизнес-логики

**Файл: `backend/app/services/test_service.py`**
```python
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.db.models.test import Test
from app.db.models.questions import Question
from app.schemas.test import TestCreate
import logging

logger = logging.getLogger(__name__)

def create_test_with_questions(db: Session, payload: TestCreate) -> Test:
    """Создание теста с вопросами через сервисный слой"""
    try:
        # Создаем тест
        test = Test(
            title=payload.title,
            description=payload.description,
            duration=payload.duration
        )
        db.add(test)
        db.flush()  # Получаем ID без коммита
        
        # Создаем вопросы
        questions = []
        for q in payload.questions:
            question = Question(
                test_id=test.id,
                question_text=q.question_text,
                options=q.options,
                correct_answers=q.correct_answers,
                question_type=q.question_type
            )
            questions.append(question)
        
        db.bulk_save_objects(questions)
        db.commit()
        db.refresh(test)
        
        logger.info(f"Test created successfully: {test.id}")
        return test
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нарушение целостности данных"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера"
        )

def find_tests_by_title(db: Session, title_query: str, limit: int = 20):
    """Поиск тестов по названию"""
    return (
        db.query(Test)
        .filter(Test.title.ilike(f"%{title_query}%"))
        .order_by(Test.created_at.desc())
        .limit(limit)
        .all()
    )

def get_tests_with_pagination(db: Session, skip: int = 0, limit: int = 10):
    """Получение тестов с пагинацией"""
    total = db.query(Test).count()
    tests = (
        db.query(Test)
        .order_by(Test.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "tests": tests,
        "total": total,
        "skip": skip,
        "limit": limit
    }
```

### 3. Дополнительные эндпоинты

**Файл: `backend/app/api/endpoints/search.py`**
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.schemas.test import TestCreate
from app.services.test_service import find_tests_by_title, get_tests_with_pagination

router = APIRouter()

@router.get('/tests/search', response_model=List[TestCreate])
def search_tests(
    q: str = Query(..., description="Поисковый запрос"),
    db: Session = Depends(get_db)
):
    """Поиск тестов по названию"""
    if not q.strip():
        raise HTTPException(status_code=400, detail='Поисковый запрос не может быть пустым')
    
    tests = find_tests_by_title(db, q.strip())
    return tests

@router.get('/tests/paginated')
def get_tests_paginated(
    skip: int = Query(0, ge=0, description="Количество пропущенных записей"),
    limit: int = Query(10, ge=1, le=100, description="Количество записей на странице"),
    db: Session = Depends(get_db)
):
    """Получение тестов с пагинацией"""
    return get_tests_with_pagination(db, skip=skip, limit=limit)
```

### 4. Middleware для логирования

**Файл: `backend/app/middleware/logging.py`**
```python
import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Логируем входящий запрос
        logger.info(f"Request: {request.method} {request.url}")
        
        response = await call_next(request)
        
        # Логируем время выполнения
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} - {process_time:.4f}s")
        
        return response
```

### 5. Обновленный main.py с middleware

**Файл: `backend/app/main.py`**
```python
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db import get_db
from app.api.endpoints import tests_questions, auth, search
from app.middleware.logging import LoggingMiddleware
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Medical Tests API", 
    version="1.0.0",
    description="API для медицинских тестов"
)

# Middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роутеры
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(tests_questions.router, prefix="/api/v1", tags=["tests"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return {"message": "Hello, Database is connected!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

### 6. Тесты для API

**Файл: `backend/tests/test_auth.py`**
```python
from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_register_user():
    """Тест регистрации пользователя"""
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "StrongP@ssw0rd123!"
    })
    assert response.status_code in [200, 400]  # 400 если пользователь уже существует

def test_login_user():
    """Тест входа пользователя"""
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "StrongP@ssw0rd123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials():
    """Тест входа с неверными данными"""
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_profile_with_token():
    """Тест получения профиля с токеном"""
    # Сначала получаем токен
    login_response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "StrongP@ssw0rd123!"
    })
    token = login_response.json()["access_token"]
    
    # Получаем профиль
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
```

**Файл: `backend/tests/test_tests.py`**
```python
from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_create_test():
    """Тест создания теста"""
    test_data = {
        "title": "Test Medical Exam",
        "description": "Basic medical knowledge test",
        "duration": 30,
        "questions": [
            {
                "question_text": "What is the main function of the heart?",
                "options": ["Pump blood", "Digest food", "Filter air", "Store energy"],
                "correct_answers": [0],
                "question_type": "multiple_choice"
            }
        ]
    }
    
    response = client.post("/api/v1/tests", json=test_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == test_data["title"]
    assert len(data["questions"]) == 1

def test_get_tests():
    """Тест получения списка тестов"""
    response = client.get("/api/v1/tests")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_search_tests():
    """Тест поиска тестов"""
    response = client.get("/api/v1/tests/search?q=medical")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
```

### 7. Конфигурация для продакшена

**Файл: `backend/app/core/production.py`**
```python
import os
from app.core.config import settings

class ProductionSettings:
    """Настройки для продакшена"""
    
    # Безопасность
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in production")
    
    # База данных
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL must be set in production")
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "").split(",")
    
    # Логирование
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "/var/log/app.log")
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    @classmethod
    def validate(cls):
        """Проверка обязательных переменных окружения"""
        required_vars = ["SECRET_KEY", "DATABASE_URL"]
        missing = [var for var in required_vars if not getattr(cls, var, None)]
        if missing:
            raise ValueError(f"Missing required environment variables: {missing}")
```

### 8. Rate Limiting Middleware

**Файл: `backend/app/middleware/rate_limit.py`**
```python
import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()
        
        # Очищаем старые запросы
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < 60
        ]
        
        # Проверяем лимит
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Too many requests"
            )
        
        # Добавляем текущий запрос
        self.requests[client_ip].append(current_time)
        
        return await call_next(request)
```

### 9. Обновленные зависимости

**Файл: `backend/requirements.txt`**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg[binary]==3.1.13
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic[email]==2.5.0
pydantic-settings==2.1.0
pytest==7.4.3
httpx==0.25.2
python-dotenv==1.0.0
```

### 10. Dockerfile для продакшена

**Файл: `backend/Dockerfile.prod`**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements и устанавливаем Python зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY . .

# Создаем пользователя для безопасности
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Экспонируем порт
EXPOSE 8000

# Команда запуска
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 11. Docker Compose для продакшена

**Файл: `docker-compose.prod.yml`**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: medical_application
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      DATABASE_URL: postgresql+psycopg://postgres:${POSTGRES_PASSWORD}@db:5432/medical_application
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
    depends_on:
      - db
    ports:
      - "8000:8000"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

### 12. Nginx конфигурация

**Файл: `nginx.conf`**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 13. Скрипт для деплоя

**Файл: `backend/deploy.sh`**
```bash
#!/bin/bash

# Скрипт для деплоя в продакшен

set -e

echo "Starting deployment..."

# Проверяем переменные окружения
if [ -z "$SECRET_KEY" ]; then
    echo "ERROR: SECRET_KEY not set"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    exit 1
fi

# Останавливаем старые контейнеры
docker-compose -f docker-compose.prod.yml down

# Собираем новые образы
docker-compose -f docker-compose.prod.yml build --no-cache

# Запускаем миграции
docker-compose -f docker-compose.prod.yml run --rm api alembic upgrade head

# Запускаем приложение
docker-compose -f docker-compose.prod.yml up -d

echo "Deployment completed successfully!"
```

### 14. Обновленный .env.example

**Файл: `backend/.env.example`**
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medical_application
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Logging
LOG_LEVEL=INFO
LOG_FILE=app.log

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Optional single DATABASE_URL (overrides postgres fields above if set)
# DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/medical_application
```

## Порядок внедрения

1. **Обновите схемы**: добавьте `app/schemas/auth.py`
2. **Создайте сервисный слой**: добавьте `app/services/test_service.py`
3. **Добавьте новые эндпоинты**: создайте `app/api/endpoints/search.py`
4. **Обновите main.py**: добавьте middleware и новые роутеры
5. **Настройте тесты**: создайте папку `tests/` с тестами
6. **Настройте продакшен**: добавьте Dockerfile и docker-compose.prod.yml
7. **Запустите тесты**: `pytest tests/`
8. **Проверьте API**: откройте `http://localhost:8000/docs`

Все файлы готовы к копированию и использованию!


