# Developer Documentation

Техническая документация для разработчиков проекта Medical Tests App.

## 🐍 Виртуальная среда Python

### Установленные библиотеки

| Библиотека | Версия | Назначение |
|------------|--------|------------|
| FastAPI | 0.116.1 | Веб-фреймворк для API |
| Uvicorn | 0.24.0 | ASGI сервер |
| SQLAlchemy | 2.0.42 | ORM для базы данных |
| psycopg | 3.2.9 | Драйвер PostgreSQL |
| Alembic | 1.12.1 | Миграции БД |
| Pydantic | 2.11.7 | Валидация данных |
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
    __tablename__ = "tests"
    
    test_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    duration = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### Question Model
```python
class Question(Base):
    __tablename__ = "questions"
    
    id = Column(String, primary_key=True, index=True)
    test_id = Column(String, ForeignKey("tests.test_id"))
    question_text = Column(String, nullable=False)
    options = Column(ARRAY(String), nullable=False)
    correct_answers = Column(ARRAY(Integer), nullable=False)
    question_type = Column(String, default="multiple_choice")
```

## 🔧 API Endpoints

### Структура API

```
/api/v1/
├── tests/           # Основные операции с тестами
├── questions/       # Управление вопросами
└── users/          # Управление пользователями
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

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
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
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
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
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment variables

```bash
# .env файл
DATABASE_URL=postgresql://user:password@localhost/medical_tests
SECRET_KEY=your-secret-key-here
DEBUG=False
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
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

---

> 📖 **Основная документация**: Вернитесь к `README.md` для общей информации о проекте
