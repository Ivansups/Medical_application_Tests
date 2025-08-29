## Medical Application Tests

Полноценный шаблон приложения «Тесты для медицинского обучения». Бэкенд на FastAPI/PostgreSQL, фронтенд на Next.js/NextAuth/Prisma. В репозитории есть готовые CRUD-эндпоинты для тестов и базовая аутентификация через JWT.

### Структура
- `backend/` — FastAPI, SQLAlchemy, Alembic, JWT
- `frontend/` — Next.js (App Router), NextAuth, Prisma
- `Dev_back.md` — учебник и гайд для бэкенда
- `Dev_front.md` — учебник и гайд для фронтенда

### Требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Быстрый запуск
1) Бэкенд
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # отредактируй под себя
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
2) Фронтенд
```
cd frontend/frontend_project
npm i
cp .env.example .env  # отредактируй под себя
npm run dev
```

### Ключевые возможности
- CRUD тестов: создание/обновление/получение/удаление тестов и вопросов
- JWT-аутентификация: регистрация, логин, получение профиля
- Система прохождения тестов: попытки, ответы, результаты
- Упрощенная схема БД: 5 таблиц вместо 6, оптимизированная производительность
- CORS готов к работе с фронтом на `http://localhost:3000`

### Интеграция фронт↔бэк
- Бэкенд публикует API под префиксом `/api/v1`.
- Фронт должен использовать `NEXT_PUBLIC_API_URL=http://localhost:8000` и вызывать пути вида `/api/v1/...`.
- Рекомендуется Credentials-провайдер в NextAuth, который дергает `/api/v1/auth/login` (см. `Dev_front.md`).

### Дорожная карта
- ✅ Расширение доменной модели: попытки прохождения, результаты, аналитика
- ✅ Роли/права пользователей (student/admin)
- ✅ Упрощение схемы БД для лучшей производительности
- Улучшение DX: единая клиентская библиотека API во фронте, генерация типов по OpenAPI
- Тестирование (unit/e2e) и CI
- Production-хардненинг: rate limit, audit logs, observability

### Документация для разработчиков
- Бэкенд: см. `Dev_back.md`
- Фронтенд: см. `Dev_front.md`

Вкладывайся небольшими PR: одна существенная задача — один PR, тесты и описание изменений обязательны.