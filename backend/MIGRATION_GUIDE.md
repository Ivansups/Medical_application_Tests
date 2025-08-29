# Руководство по миграциям

## Быстрый старт

### 1. Локальная разработка
```bash
# Активируйте виртуальное окружение
source venv/bin/activate

# Проверьте статус миграций
alembic current
alembic history

# Обновите миграции (если нужно)
alembic upgrade head

# Создайте новую миграцию
alembic revision --autogenerate -m "Описание изменений"
alembic upgrade head
```

### 2. Docker разработка
```bash
# Запустите контейнеры
docker-compose up -d

# Обновите миграции в Docker
DATABASE_URL=postgresql+psycopg://postgres:3891123@localhost:5432/medical_application alembic upgrade head

# Проверьте таблицы
docker exec medical_tests_db psql -U postgres -d medical_application -c '\dt'
```

### 3. Проверка состояния
```bash
# Запустите скрипт проверки
python3 check_migrations.py

# Или вручную
alembic current    # Текущая версия
alembic heads      # Последние версии
alembic check      # Проверка состояния
```

## Структура миграций

### Текущие таблицы:
- `users` - Пользователи системы
- `tests` - Тесты
- `questions` - Вопросы в тестах
- `test_attempts` - Попытки прохождения тестов
- `user_answers` - Ответы пользователей

### Последняя версия: `84943c10d7a0`

## Устранение проблем

### Проблема: "Target database is not up to date"
**Решение:**
```bash
alembic upgrade head
```

### Проблема: "Can't locate revision identified by"
**Решение:**
```bash
# Проверьте историю
alembic history

# Если нужно, откатитесь к определенной версии
alembic downgrade <revision_id>
```

### Проблема: Модели не импортируются
**Решение:**
```bash
# Проверьте импорты
python -c "from app.db.models import *; print('OK')"

# Убедитесь, что все модели в __init__.py
```

## Полезные команды

```bash
# Просмотр истории
alembic history --verbose

# Просмотр SQL без выполнения
alembic upgrade head --sql

# Создание пустой миграции
alembic revision -m "Описание"

# Откат на одну версию
alembic downgrade -1

# Откат к определенной версии
alembic downgrade <revision_id>
```

## Переменные окружения

Для локальной разработки:
```bash
export DATABASE_URL=postgresql+psycopg://postgres:3891123@localhost:5432/medical_application
```

Для Docker:
```bash
export DATABASE_URL=postgresql+psycopg://postgres:3891123@db:5432/medical_application
```
