# Developer Documentation

Техническая документация для разработчиков проекта Medical Tests App.

## 🐍 Виртуальная среда Python

### Установленные библиотеки

| Библиотека | Версия | Назначение |
|------------|--------|------------|
| FastAPI | 0.116.1+ | Веб-фреймворк для API |
| Uvicorn | 0.24.0 | ASGI сервер |
| SQLAlchemy | 2.0.42+ | ORM для базы данных |
| psycopg | 3.2.9+ | Драйвер PostgreSQL |
| Alembic | 1.12.1 | Миграции БД |
| Pydantic | 2.11.7+ | Валидация данных |
| pydantic-settings | 2.10.1+ | Настройки приложения |
| python-dotenv | 1.0.0 | Переменные окружения |

### Управление виртуальной средой

```bash
# Активация
source venv/bin/activate

# Деактивация
deactivate

# Проверка установленных пакетов
pip list

# Обновление зависимостей
pip install --upgrade package_name
```

### Решение проблем совместимости

```bash
# Если возникают ошибки совместимости
pip install --upgrade fastapi sqlalchemy pydantic psycopg[binary]

# Переустановка виртуальной среды
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

## 🗄️ База данных

### Структура базы данных

#### Таблица `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    credits INTEGER DEFAULT 3
);
```

#### Таблица `tests`
```sql
CREATE TABLE tests (
    test_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER NOT NULL
);
```

#### Таблица `questions`
```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(test_id),
    question_text TEXT NOT NULL,
    options JSON,
    correct_answers JSON,
    question_type VARCHAR(50) DEFAULT 'multiple_choice'
);
```

### Миграции Alembic

```bash
# Создание новой миграции
alembic revision --autogenerate -m "Описание изменений"

# Применение миграций
alembic upgrade head

# Откат миграции
alembic downgrade -1

# Сброс всех миграций (только для разработки!)
alembic downgrade base
alembic upgrade head
```

### Модели данных

#### Test Model
```python
class Test(Base):
    __tablename__ = 'tests'
    
    test_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    duration = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    questions = relationship("Question", back_populates="test", cascade="all, delete-orphan")
```

#### Question Model
```python
class Question(Base):
    __tablename__ = 'questions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey('tests.test_id'), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON)  # Храним как JSON для списков
    correct_answers = Column(JSON)  # Храним как JSON для списков
    question_type = Column(String(50), default='multiple_choice')
    
    test = relationship("Test", back_populates="questions")
```

#### User Model
```python
class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(100))
    credits = Column(Integer, default=3)
```

## 🔧 API Endpoints

### Структура API

```
/api/v1/
└── tests/           # Основные операции с тестами
    ├── GET /        # Получить список тестов
    ├── POST /       # Создать новый тест
    ├── GET /{id}    # Получить тест по ID
    ├── DELETE /{id} # Удалить тест по ID
    └── DELETE /     # Удалить все тесты
```

### Примеры запросов

#### Создание теста
```bash
curl -X POST "http://localhost:8000/api/v1/tests" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Медицинский тест",
    "description": "Тест по основам медицины",
    "duration": 30,
    "questions": [
      {
        "question_text": "Что такое артериальное давление?",
        "options": ["Давление крови", "Давление воздуха", "Давление воды"],
        "correct_answers": [0],
        "question_type": "multiple_choice"
      }
    ]
  }'
```

#### Получение теста
```bash
curl "http://localhost:8000/api/v1/tests/{test_id}"
```

#### Удаление теста
```bash
curl -X DELETE "http://localhost:8000/api/v1/tests/{test_id}"
```

## 🐳 Docker

### Команды Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f [service_name]

# Пересборка
docker-compose up --build

# Остановка и удаление контейнеров + volumes
docker-compose down -v
```

### Конфигурация сервисов

#### База данных (PostgreSQL)
```yaml
db:
  image: postgres:15
  environment:
    POSTGRES_DB: medical_application
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: 3891123
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

#### API (FastAPI)
```yaml
api:
  build:
    context: ./backend
  environment:
    DATABASE_URL: postgresql+psycopg://postgres:3891123@db:5432/medical_application
  ports:
    - "8000:8000"
  depends_on:
    db:
      condition: service_healthy
```

### Dockerfile оптимизации

#### Backend Dockerfile
```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🧪 Тестирование

### Backend тесты

```bash
# Установка тестовых зависимостей
pip install pytest pytest-asyncio httpx

# Запуск тестов
pytest

# Запуск с coverage
pytest --cov=app

# Запуск конкретного теста
pytest tests/test_api.py::test_create_test
```

### Frontend тесты

```bash
# Установка тестовых зависимостей
npm install --save-dev jest @testing-library/react

# Запуск тестов
npm test

# Запуск с coverage
npm test -- --coverage
```

## 🔍 Отладка

### Backend отладка

```bash
# Запуск с debug режимом
uvicorn app.main:app --reload --log-level debug

# Проверка импортов
python -c "from app.main import app; print('✓ OK')"

# Проверка подключения к БД
python -c "from app.db.session import engine; print('✓ DB OK')"
```

### Frontend отладка

```bash
# Запуск в development режиме
npm run dev

# Проверка типов TypeScript
npx tsc --noEmit

# Линтинг
npm run lint
```

## 📝 Логирование

### Backend логирование

```python
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("Application started")
```

### Frontend логирование

```typescript
// Консольное логирование
console.log('Debug info:', data);
console.warn('Warning:', warning);
console.error('Error:', error);

// Логирование в production
if (process.env.NODE_ENV === 'development') {
    console.log('Debug info:', data);
}
```

## 🚀 CI/CD

### GitHub Actions пример

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend/frontend_project
          npm ci
      - name: Run tests
        run: |
          cd frontend/frontend_project
          npm test
```

## 📊 Мониторинг

### Health checks

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

@app.get("/health/db")
async def db_health_check():
    try:
        # Проверка подключения к БД
        db = next(get_db())
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}
```

## 🔐 Безопасность

### CORS настройка

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment variables

```bash
# .env файл
DATABASE_URL=postgresql://postgres:3891123@localhost/medical_application
SECRET_KEY=your-secret-key-here
DEBUG=False
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 📚 Полезные команды

### Backend

```bash
# Очистка кэша Python
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# Проверка зависимостей
pip check

# Обновление requirements.txt
pip freeze > requirements.txt

# Проверка подключения к БД
python -c "from app.db.session import engine; print('✓ DB connection OK')"
```

### Frontend

```bash
# Очистка кэша Next.js
rm -rf .next

# Проверка bundle size
npm run build
npx @next/bundle-analyzer

# Обновление зависимостей
npm update
npm audit fix
```

### База данных

```bash
# Подключение к PostgreSQL
psql -h localhost -U postgres -d medical_application

# Проверка таблиц
\dt

# Проверка данных
SELECT * FROM tests LIMIT 5;
SELECT * FROM questions LIMIT 5;
SELECT * FROM users LIMIT 5;
```

## 🔄 Миграции и схема БД

### История миграций

1. **001_create_users_table.py** - Создание таблицы пользователей
2. **002_create_tests_and_questions_tables.py** - Создание таблиц тестов и вопросов
3. **4d38510afd5e_update_question_fields_to_use_json_type.py** - Обновление полей вопросов для использования JSON типа

### Важные изменения схемы

- Поля `options` и `correct_answers` в таблице `questions` теперь используют тип JSON
- Поле `question_text` изменено на тип TEXT для поддержки длинных вопросов
- Добавлена связь между таблицами `tests` и `questions` через внешний ключ

---

> 📖 **Основная документация**: Вернитесь к `README.md` для общей информации о проекте
