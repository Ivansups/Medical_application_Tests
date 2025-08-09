# Medical Tests App

Приложение для проведения медицинских тестов с FastAPI бэкендом и Next.js фронтендом.

## 🚀 Быстрый старт

### Вариант 1: Docker (рекомендуется)
```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка работы:
# 🌐 Фронтенд: http://localhost:3000
# 🔧 API: http://localhost:8000
# 📚 Документация API: http://localhost:8000/docs
# 🗄️ База данных: localhost:5432
```

### Вариант 2: Локально
```bash
# Проверка установки
./test-local.sh

# Терминал 1 - Бэкенд
cd backend
source ../venv/bin/activate
uvicorn app.main:app --reload

# Терминал 2 - Фронтенд
cd frontend
npm run dev
```

## 📋 Предварительные требования

### Для бэкенда
- Python 3.8+ (рекомендуется Python 3.13)
- pip
- PostgreSQL (или SQLite для разработки)

### Для фронтенда
- Node.js 18+
- npm

## ⚙️ Пошаговая настройка

### 1. Клонирование и настройка окружения

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd Medical_application_Tests

# Создайте виртуальное окружение Python
python -m venv venv

# Активируйте виртуальное окружение
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
```

### 2. Настройка бэкенда

```bash
# Перейдите в папку бэкенда
cd backend

# Установите зависимости
pip install -r requirements.txt

# Настройте базу данных (если используете PostgreSQL)
# Создайте файл .env в папке backend:
echo "DATABASE_URL=postgresql://user:password@localhost/medical_tests" > .env

# Или для SQLite (по умолчанию):
echo "DATABASE_URL=sqlite:///./medical_tests.db" > .env

# Примените миграции
alembic upgrade head

# Запустите сервер разработки
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Настройка фронтенда

```bash
# Откройте новый терминал и перейдите в папку фронтенда
cd frontend

# Установите зависимости
npm install

# Создайте файл с переменными окружения
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Запустите сервер разработки
npm run dev
```

## 🔌 API эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/v1/tests` | Получить список всех тестов |
| GET | `/api/v1/tests/{id}` | Получить тест по ID |
| POST | `/api/v1/tests` | Создать новый тест |
| PUT | `/api/v1/tests/{id}` | Обновить тест |
| DELETE | `/api/v1/tests/{id}` | Удалить тест |

### Примеры запросов

#### Получение списка тестов
```javascript
const response = await fetch('http://localhost:8000/api/v1/tests');
const tests = await response.json();
```

#### Создание нового теста
```javascript
const response = await fetch('http://localhost:8000/api/v1/tests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Название теста',
    description: 'Описание теста',
    duration: 30,
    questions: [
      {
        question_txt: 'Вопрос теста',
        options: ['Вариант 1', 'Вариант 2', 'Вариант 3'],
        answer: [0] // Индекс правильного ответа
      }
    ]
  })
});
const newTest = await response.json();
```

## 🗄️ Модели данных

```typescript
interface Test {
  test_id: string;
  title: string;
  description: string | null;
  duration: number;
  questions: Question[];
  created_at: string;
}

interface Question {
  id: string;
  test_id: string;
  question_text: string;
  options: string[];
  correct_answers: number[];
  question_type: string;
}

interface TestCreate {
  title: string;
  description?: string;
  duration: number;
  questions: QuestionCreate[];
}
```

## 🐳 Docker команды

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Пересборка
docker-compose up --build

# Остановка и удаление контейнеров
docker-compose down -v
```

## 🔧 Основные команды разработки

### Бэкенд
```bash
# Создать новую миграцию
alembic revision --autogenerate -m "Описание изменений"

# Применить миграции
alembic upgrade head

# Откатить миграцию
alembic downgrade -1

# Запустить тесты (если есть)
pytest

# Проверить импорты
python -c "from app.main import app; print('✓ Приложение импортировано')"
```

### Фронтенд
```bash
# Проверить типы TypeScript
npx tsc --noEmit

# Запустить линтер
npm run lint

# Очистить кэш Next.js
rm -rf .next
npm run build
```

## 📁 Структура проекта

```
Medical_application_Tests/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/     # API эндпоинты
│   │   ├── core/              # Конфигурация
│   │   ├── db/                # Модели и CRUD
│   │   │   ├── models/        # SQLAlchemy модели
│   │   │   └── crud/          # CRUD операции
│   │   └── schemas/           # Pydantic схемы
│   ├── alembic/               # Миграции БД
│   ├── requirements.txt       # Python зависимости
│   └── Dockerfile            # Docker образ
├── frontend/
│   ├── app/                   # Next.js приложение
│   ├── package.json           # Node.js зависимости
│   └── Dockerfile            # Docker образ
├── docker-compose.yml         # Docker Compose
├── venv/                      # Python виртуальная среда
└── README.md                  # Эта документация
```

## ✅ Проверка работоспособности

### Проверка бэкенда
```bash
# Проверьте, что API отвечает
curl http://localhost:8000/
# Ожидаемый ответ: {"message": "Hello, Database is connected!"}

# Проверьте документацию API
# Откройте в браузере: http://localhost:8000/docs
```

### Проверка фронтенда
```bash
# Откройте в браузере: http://localhost:3000
# Вы должны увидеть интерфейс приложения
```

## 🚀 Настройка для продакшена

### Бэкенд
1. Измените `DATABASE_URL` на продакшен базу данных
2. Настройте CORS для домена фронтенда
3. Добавьте аутентификацию и авторизацию
4. Настройте логирование

### Фронтенд
1. Измените `NEXT_PUBLIC_API_URL` на продакшен URL API
2. Выполните сборку: `npm run build`
3. Запустите: `npm start`

## 🐛 Решение проблем

### Проблемы с бэкендом

**Ошибка подключения к базе данных:**
```bash
# Проверьте DATABASE_URL в .env файле
# Убедитесь, что база данных запущена
# Проверьте права доступа пользователя
```

**Ошибка миграций:**
```bash
# Сбросьте миграции (только для разработки!)
alembic downgrade base
alembic upgrade head
```

**Проблемы с импортами:**
```bash
# Очистите кэш Python
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# Проверьте импорты
python -c "from app.main import app; print('✓ OK')"
```

### Проблемы с фронтендом

**Ошибка CORS:**
```bash
# Убедитесь, что бэкенд запущен
# Проверьте NEXT_PUBLIC_API_URL
# Добавьте CORS middleware в бэкенд
```

**Ошибка сборки:**
```bash
# Очистите кэш
rm -rf .next
npm run build
```

## 📚 Дополнительные ресурсы

- **FastAPI документация**: https://fastapi.tiangolo.com/
- **SQLAlchemy документация**: https://docs.sqlalchemy.org/
- **Next.js документация**: https://nextjs.org/docs
- **PostgreSQL документация**: https://www.postgresql.org/docs/

## 🤝 Контакты

При возникновении проблем обращайтесь к команде разработки или создавайте issue в репозитории.

---

**Статус проекта**: ✅ Готово к использованию
- Бэкенд: FastAPI + PostgreSQL + Alembic
- Фронтенд: Next.js + TypeScript
- Docker контейнеры настроены
- API документация: http://localhost:8000/docs

---

> 📖 **Для разработчиков**: Подробная техническая документация находится в файле `DEVELOPER.md`
