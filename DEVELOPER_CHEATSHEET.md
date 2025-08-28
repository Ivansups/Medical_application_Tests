# 🚀 Шпаргалка разработчика - Medical Tests Application

## 📋 Содержание
- [Docker команды](#docker-команды)
- [Миграции Alembic](#миграции-alembic)
- [Сервер и API](#сервер-и-api)
- [База данных](#база-данных)
- [Модели и CRUD](#модели-и-crud)
- [Отладка и логи](#отладка-и-логи)
- [Полезные команды](#полезные-команды)

---

## 🐳 Docker команды

### Основные операции
```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes (сброс БД)
docker-compose down -v

# Перезапуск сервиса
docker-compose restart api

# Просмотр логов
docker-compose logs api
docker-compose logs -f api  # в реальном времени

# Просмотр статуса контейнеров
docker-compose ps
```

### Работа с контейнерами
```bash
# Войти в контейнер API
docker-compose exec api bash

# Войти в контейнер БД
docker-compose exec db psql -U postgres -d medical_application

# Выполнить команду в контейнере
docker-compose exec api python -c "print('Hello')"

# Пересобрать образ
docker-compose build api
docker-compose up -d --build api
```

---

## 🔄 Миграции Alembic

### Основные команды
```bash
# Создать новую миграцию (автогенерация)
docker-compose exec api alembic revision --autogenerate -m "Описание изменений"

# Создать пустую миграцию
docker-compose exec api alembic revision -m "Ручная миграция"

# Применить все миграции
docker-compose exec api alembic upgrade head

# Применить конкретную миграцию
docker-compose exec api alembic upgrade <revision_id>

# Откат на одну миграцию назад
docker-compose exec api alembic downgrade -1

# Откат на конкретную миграцию
docker-compose exec api alembic downgrade <revision_id>
```

### Информационные команды
```bash
# Просмотр текущего состояния
docker-compose exec api alembic current

# Просмотр истории миграций
docker-compose exec api alembic history

# Просмотр конкретной миграции
docker-compose exec api alembic show <revision_id>

# Проверка статуса миграций
docker-compose exec api alembic check

# Просмотр SQL без выполнения
docker-compose exec api alembic upgrade head --sql
```

### Примеры использования
```bash
# Добавить новую таблицу
docker-compose exec api alembic revision --autogenerate -m "Add test_attempts table"
docker-compose exec api alembic upgrade head

# Добавить колонку в существующую таблицу
docker-compose exec api alembic revision --autogenerate -m "Add email column to users"
docker-compose exec api alembic upgrade head

# Откатить последнее изменение
docker-compose exec api alembic downgrade -1
```

---

## 🌐 Сервер и API

### Запуск сервера
```bash
# Запуск через Docker (рекомендуется)
docker-compose up -d

# Запуск локально (из папки backend)
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Проверка работоспособности
```bash
# Health check
curl http://localhost:8000/health

# Проверка БД
curl http://localhost:8000/health/db

# Корневой эндпоинт
curl http://localhost:8000/

# Swagger UI
open http://localhost:8000/docs
```

### Полезные URL
- **API документация**: `http://localhost:8000/docs`
- **ReDoc документация**: `http://localhost:8000/redoc`
- **Health check**: `http://localhost:8000/health`
- **Frontend**: `http://localhost:3000`

---

## 🗄️ База данных

### Подключение к БД
```bash
# Через Docker
docker-compose exec db psql -U postgres -d medical_application

# Локально (если PostgreSQL установлен)
psql -h localhost -U postgres -d medical_application
```

### Основные SQL команды
```sql
-- Просмотр таблиц
\dt

-- Просмотр структуры таблицы
\d users

-- Просмотр данных
SELECT * FROM users LIMIT 5;

-- Просмотр миграций
SELECT * FROM alembic_version;

-- Очистка таблицы
TRUNCATE TABLE users CASCADE;
```

### Резервное копирование
```bash
# Создать бэкап
docker-compose exec db pg_dump -U postgres medical_application > backup.sql

# Восстановить из бэкапа
docker-compose exec -T db psql -U postgres medical_application < backup.sql
```

---

## 📊 Модели и CRUD

### Структура моделей
```
backend/app/db/models/
├── __init__.py
├── base.py
├── user.py
├── test.py
├── questions.py
├── test_attempts.py
└── user_answers.py
```

### Создание новой модели
1. Создать файл `backend/app/db/models/new_model.py`
2. Добавить импорт в `__init__.py`
3. Создать миграцию
4. Применить миграцию

### Пример модели
```python
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Example(Base):
    __tablename__ = 'examples'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## 🐛 Отладка и логи

### Просмотр логов
```bash
# Логи API
docker-compose logs api
docker-compose logs -f api

# Логи БД
docker-compose logs db
docker-compose logs -f db

# Логи всех сервисов
docker-compose logs
docker-compose logs -f
```

### Отладка в контейнере
```bash
# Войти в контейнер API
docker-compose exec api bash

# Проверить переменные окружения
docker-compose exec api env | grep DATABASE

# Проверить подключение к БД
docker-compose exec api python -c "from app.db.session import engine; print(engine.url)"
```

### Полезные команды отладки
```bash
# Проверить статус всех сервисов
docker-compose ps

# Проверить использование ресурсов
docker stats

# Очистить неиспользуемые ресурсы
docker system prune -a

# Проверить порты
netstat -an | grep 8000
lsof -i :8000
```

---

## 🛠️ Полезные команды

### Управление виртуальным окружением
```bash
# Создать виртуальное окружение
python3 -m venv venv

# Активировать
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Обновить зависимости
pip install --upgrade -r requirements.txt
```

### Git команды
```bash
# Проверить статус
git status

# Добавить изменения
git add .

# Создать коммит
git commit -m "Add new feature"

# Отправить изменения
git push origin main

# Обновить локальную копию
git pull origin main
```

### Системные команды
```bash
# Проверить свободное место
df -h

# Проверить использование памяти
free -h

# Найти процессы
ps aux | grep python

# Убить процесс
kill -9 <PID>
```

### Быстрые проверки
```bash
# Проверить все сервисы
curl http://localhost:8000/health && \
curl http://localhost:3000 && \
docker-compose ps

# Проверить миграции
docker-compose exec api alembic current && \
docker-compose exec api alembic history

# Проверить логи
docker-compose logs --tail=10
```

---

## 🚨 Решение проблем

### Проблема: Порт занят
```bash
# Найти процесс
lsof -i :8000

# Убить процесс
kill -9 <PID>

# Или использовать другой порт
python -m uvicorn app.main:app --port 8001
```

### Проблема: БД не подключается
```bash
# Проверить статус PostgreSQL
brew services list | grep postgresql

# Перезапустить PostgreSQL
brew services restart postgresql@14

# Проверить подключение
psql -h localhost -U postgres -d medical_application
```

### Проблема: Миграции не применяются
```bash
# Сбросить БД
docker-compose down -v
docker-compose up -d

# Применить миграции заново
docker-compose exec api alembic upgrade head
```

### Проблема: Контейнер не запускается
```bash
# Проверить логи
docker-compose logs api

# Пересобрать образ
docker-compose build api
docker-compose up -d api

# Проверить ресурсы
docker stats
```

---

## 📝 Шаблоны команд

### Полный цикл разработки
```bash
# 1. Запустить сервисы
docker-compose up -d

# 2. Создать модель
# (редактировать файлы моделей)

# 3. Создать миграцию
docker-compose exec api alembic revision --autogenerate -m "Add new feature"

# 4. Применить миграцию
docker-compose exec api alembic upgrade head

# 5. Проверить API
curl http://localhost:8000/health

# 6. Открыть документацию
open http://localhost:8000/docs
```

### Отладка проблемы
```bash
# 1. Проверить статус
docker-compose ps

# 2. Проверить логи
docker-compose logs api

# 3. Проверить БД
docker-compose exec api alembic current

# 4. Проверить API
curl http://localhost:8000/health

# 5. Перезапустить при необходимости
docker-compose restart api
```

---

## 🎯 Быстрые ссылки

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000
- **Health**: http://localhost:8000/health

---

*Последнее обновление: $(date)*
