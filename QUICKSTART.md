# Быстрый старт для разработчика

## 1. Клонирование и проверка
```bash
git clone <repository-url>
cd Medical_application_Tests
./test-local.sh
```

## 2. Запуск (выберите один способ)

### Вариант A: Docker (проще)
```bash
docker-compose up -d
```

### Вариант B: Локально
```bash
# Терминал 1 - Бэкенд
cd backend
source ../venv/bin/activate
uvicorn app.main:app --reload

# Терминал 2 - Фронтенд
cd frontend
npm run dev
```

## 3. Проверка работы
- 🌐 Фронтенд: http://localhost:3000
- 🔧 API: http://localhost:8000
- 📚 Документация API: http://localhost:8000/docs

## 4. Основные команды
```bash
# Остановка Docker
docker-compose down

# Просмотр логов
docker-compose logs -f

# Пересборка
docker-compose up --build
```

## 5. Структура API
```typescript
// Получить тесты
GET /api/v1/tests_all_tests

// Создать тест
POST /api/v1/tests
{
  "title": "Название",
  "description": "Описание"
}
```

Готово! 🚀
