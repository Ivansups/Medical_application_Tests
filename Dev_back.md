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


