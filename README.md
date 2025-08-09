# Medical Tests App

Приложение для проведения медицинских тестов.

## Быстрый старт

### С Docker (рекомендуется)
```bash
# Запуск всех сервисов
docker-compose up -d

# Фронтенд будет на: http://localhost:3000
# API: http://localhost:8000/docs
# База данных: localhost:5432
```

### Без Docker
```bash
# Проверка установки
./test-local.sh

# Бэкенд
cd backend
source ../venv/bin/activate
uvicorn app.main:app --reload

# Фронтенд (новый терминал)
cd frontend
npm run dev
```

## API эндпоинты

- `GET /api/v1/tests_all_tests` - список тестов
- `POST /api/v1/tests` - создать тест
- `GET /api/v1/tests/{id}` - получить тест
- `PUT /api/v1/tests/{id}` - обновить тест
- `DELETE /api/v1/tests/{id}` - удалить тест

## Статус

✅ **Готово к использованию**
- Бэкенд: FastAPI + PostgreSQL
- Фронтенд: Next.js + TypeScript
- Docker контейнеры настроены
- API документация: http://localhost:8000/docs

Подробная документация: [SETUP.md](SETUP.md)
