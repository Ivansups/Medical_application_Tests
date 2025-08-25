## Бэкенд разработчику: руководство и учебник

Это практичный гайд по текущему бэкенду (FastAPI + SQLAlchemy + PostgreSQL) и чек-лист того, что нужно доделать согласно roadmap.

### 🚨 Текущее состояние проекта

#### ✅ Что уже реализовано:
- Базовая структура FastAPI приложения
- Модели БД: User, Test, Question
- CRUD операции для тестов и вопросов
- JWT аутентификация (базовая)
- Alembic миграции
- Docker конфигурация

#### ❌ Критические проблемы (Phase 1):
- JWT токены не сохраняются в сессии NextAuth
- Отсутствуют таблицы для отслеживания попыток прохождения тестов
- Проблемы с CORS между фронтендом и бэкендом
- Неполная система ролей пользователей
- Эндпоинт `/api/v1/auth/me` не возвращает данные пользователя

### 🎯 Приоритетные задачи (Phase 1)

#### 1. Исправить аутентификацию
```python
# backend/app/core/auth.py - НЕОБХОДИМО ОБНОВИТЬ
from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)  # 7 дней для refresh token
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### 2. Создать недостающие таблицы БД
```python
# backend/alembic/versions/xxx_add_test_attempts_tables.py
"""add test attempts tables

Revision ID: xxx
Revises: previous_revision
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    # Создаем таблицу попыток прохождения тестов
    op.create_table('test_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('test_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('score', sa.Integer(), nullable=True),
        sa.Column('max_score', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, default='in_progress'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['test_id'], ['tests.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Создаем таблицу ответов пользователей
    op.create_table('user_answers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('attempt_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('answer_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_correct', sa.Boolean(), nullable=True),
        sa.Column('answered_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['attempt_id'], ['test_attempts.id'], ),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Добавляем поле role в таблицу users
    op.add_column('users', sa.Column('role', sa.String(length=20), nullable=True, default='student'))
    
    # Добавляем поле is_active в таблицу tests
    op.add_column('tests', sa.Column('is_active', sa.Boolean(), nullable=True, default=True))

def downgrade():
    op.drop_table('user_answers')
    op.drop_table('test_attempts')
    op.drop_column('users', 'role')
    op.drop_column('tests', 'is_active')
```

#### 3. Обновить модели БД
```python
# backend/app/db/models/user.py - ДОБАВИТЬ
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.models.base import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String(20), default='student')  # student, teacher, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

```python
# backend/app/db/models/test_attempt.py - СОЗДАТЬ НОВЫЙ ФАЙЛ
from sqlalchemy import Column, Integer, DateTime, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.models.base import Base
import uuid
from datetime import datetime

class TestAttempt(Base):
    __tablename__ = "test_attempts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    score = Column(Integer, nullable=True)
    max_score = Column(Integer, nullable=True)
    status = Column(String(20), default='in_progress')  # in_progress, completed, abandoned
    
    # Relationships
    user = relationship("User", back_populates="test_attempts")
    test = relationship("Test", back_populates="attempts")
    answers = relationship("UserAnswer", back_populates="attempt")

class UserAnswer(Base):
    __tablename__ = "user_answers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("test_attempts.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    answer_data = Column(JSONB, nullable=True)  # Для хранения ответов в JSON формате
    is_correct = Column(Boolean, nullable=True)
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    attempt = relationship("TestAttempt", back_populates="answers")
    question = relationship("Question")
```

#### 4. Исправить CORS
```python
# backend/app/main.py - ОБНОВИТЬ
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, tests_questions, search
from app.core.config import settings

app = FastAPI(
    title="Medical Tests API",
    version="1.0.0",
    description="API для медицинских тестов"
)

# Обновленные настройки CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Роутеры
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(tests_questions.router, prefix="/api/v1", tags=["tests"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])
```

### 🚀 Новые эндпоинты (Phase 2)

#### 1. Эндпоинты для прохождения тестов
```python
# backend/app/api/endpoints/test_attempts.py - СОЗДАТЬ НОВЫЙ ФАЙЛ
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, get_current_user
from app.schemas.test_attempt import TestAttemptCreate, TestAttemptResponse
from app.crud.test_attempts import create_test_attempt, get_user_attempts

router = APIRouter()

@router.post("/tests/{test_id}/start", response_model=TestAttemptResponse)
async def start_test(
    test_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Начать прохождение теста"""
    return await create_test_attempt(db, test_id, current_user.id)

@router.post("/attempts/{attempt_id}/submit-answer")
async def submit_answer(
    attempt_id: str,
    question_id: str,
    answer_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Отправить ответ на вопрос"""
    # Логика сохранения ответа
    pass

@router.post("/attempts/{attempt_id}/finish")
async def finish_test(
    attempt_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Завершить тест и получить результат"""
    # Логика завершения теста и подсчета результатов
    pass

@router.get("/attempts/my", response_model=List[TestAttemptResponse])
async def get_my_attempts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Получить мои попытки прохождения тестов"""
    return await get_user_attempts(db, current_user.id)
```

#### 2. Схемы для новых эндпоинтов
```python
# backend/app/schemas/test_attempt.py - СОЗДАТЬ НОВЫЙ ФАЙЛ
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class TestAttemptCreate(BaseModel):
    test_id: UUID

class TestAttemptResponse(BaseModel):
    id: UUID
    test_id: UUID
    user_id: UUID
    started_at: datetime
    completed_at: Optional[datetime]
    score: Optional[int]
    max_score: Optional[int]
    status: str
    
    class Config:
        from_attributes = True

class UserAnswerCreate(BaseModel):
    question_id: UUID
    answer_data: dict

class TestResult(BaseModel):
    attempt_id: UUID
    score: int
    max_score: int
    percentage: float
    correct_answers: int
    total_questions: int
    time_taken: Optional[int]  # в секундах
```

### 🔧 Обновленные зависимости

```python
# backend/app/api/dependencies.py - ОБНОВИТЬ
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth import verify_token
from app.crud.user import get_user_by_email

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Получить текущего пользователя из токена"""
    token = credentials.credentials
    email = verify_token(token)
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

async def get_current_active_user(
    current_user = Depends(get_current_user)
):
    """Получить активного пользователя"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

async def require_admin(
    current_user = Depends(get_current_active_user)
):
    """Требовать права администратора"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def require_teacher_or_admin(
    current_user = Depends(get_current_active_user)
):
    """Требовать права учителя или администратора"""
    if current_user.role not in ['teacher', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher or admin access required"
        )
    return current_user
```

### 📊 Аналитика и отчеты (Phase 2)

```python
# backend/app/api/endpoints/analytics.py - СОЗДАТЬ НОВЫЙ ФАЙЛ
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_admin
from app.services.analytics import get_test_statistics, get_user_progress

router = APIRouter()

@router.get("/analytics/tests/{test_id}/statistics")
async def get_test_analytics(
    test_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Получить статистику по тесту"""
    return await get_test_statistics(db, test_id)

@router.get("/analytics/users/{user_id}/progress")
async def get_user_analytics(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Получить прогресс пользователя"""
    return await get_user_progress(db, user_id)

@router.get("/analytics/export/results")
async def export_results(
    test_id: Optional[str] = Query(None),
    format: str = Query("csv", regex="^(csv|excel)$"),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Экспорт результатов тестов"""
    # Логика экспорта
    pass
```

### 🛡️ Безопасность (Phase 3)

```python
# backend/app/middleware/rate_limit.py - СОЗДАТЬ НОВЫЙ ФАЙЛ
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

### 🧪 Тестирование

```python
# backend/tests/test_auth.py - СОЗДАТЬ
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    """Тест регистрации пользователя"""
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "StrongP@ssw0rd123!",
        "name": "Test User"
    })
    assert response.status_code in [200, 400]

def test_login_user():
    """Тест входа пользователя"""
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "StrongP@ssw0rd123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_get_profile():
    """Тест получения профиля"""
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

### 🚀 Быстрый старт

1. **Установи зависимости:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

2. **Настрой переменные окружения:**
```bash
cp .env.example .env
# Отредактируй .env под свои настройки
```

3. **Запусти миграции:**
```bash
alembic upgrade head
```

4. **Запусти сервер:**
```bash
uvicorn app.main:app --reload --port 8000
```

5. **Проверь API:**
- Открой `http://localhost:8000/docs`
- Протестируй эндпоинты аутентификации

### 📋 Чек-лист Phase 1

- [ ] Исправить JWT токены в `app/core/auth.py`
- [ ] Создать миграцию для новых таблиц
- [ ] Обновить модели БД
- [ ] Исправить CORS в `app/main.py`
- [ ] Обновить зависимости в `app/api/dependencies.py`
- [ ] Протестировать аутентификацию
- [ ] Проверить интеграцию с фронтендом

### 📋 Чек-лист Phase 2

- [ ] Создать эндпоинты для прохождения тестов
- [ ] Реализовать логику подсчета результатов
- [ ] Добавить аналитику и отчеты
- [ ] Создать административную панель
- [ ] Добавить экспорт данных

### 📋 Чек-лист Phase 3

- [ ] Добавить rate limiting
- [ ] Реализовать audit logging
- [ ] Оптимизировать производительность
- [ ] Добавить кеширование
- [ ] Написать тесты

### 🔗 Полезные ссылки

- [FastAPI документация](https://fastapi.tiangolo.com/)
- [SQLAlchemy документация](https://docs.sqlalchemy.org/)
- [Alembic документация](https://alembic.sqlalchemy.org/)
- [JWT с Python](https://python-jose.readthedocs.io/)

---

**Примечание**: Этот документ обновляется в соответствии с roadmap. Все изменения должны быть протестированы перед внедрением в production.


