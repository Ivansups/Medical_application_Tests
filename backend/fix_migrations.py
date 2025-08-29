#!/usr/bin/env python3
"""
Скрипт для исправления проблем с миграциями
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Выполнить команду и вывести результат"""
    print(f"\n🔧 {description}")
    print(f"Команда: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Успешно!")
            if result.stdout.strip():
                print(f"Вывод: {result.stdout.strip()}")
            return True
        else:
            print("❌ Ошибка!")
            print(f"Ошибка: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ Исключение: {e}")
        return False

def fix_docker_migrations():
    """Исправить миграции в Docker"""
    print("\n" + "="*60)
    print("🐳 ИСПРАВЛЕНИЕ МИГРАЦИЙ В DOCKER")
    print("="*60)
    
    # Проверяем текущую версию в Docker
    print("\n📊 Текущее состояние:")
    run_command(
        "docker exec medical_tests_db psql -U postgres -d medical_application -c 'SELECT * FROM alembic_version;'",
        "Текущая версия в Docker"
    )
    
    # Проверяем последнюю версию миграций
    run_command(
        "source venv/bin/activate && alembic heads",
        "Последняя версия миграций"
    )
    
    # Обновляем миграции в Docker
    print("\n🔄 Обновление миграций в Docker...")
    
    # Создаем временный файл с переменными окружения для Docker
    env_content = """
DATABASE_URL=postgresql+psycopg://postgres:3891123@localhost:5432/medical_application
POSTGRES_USER=postgres
POSTGRES_PASSWORD=3891123
POSTGRES_DB=medical_application
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
"""
    
    with open(".env.docker", "w") as f:
        f.write(env_content.strip())
    
    # Обновляем миграции
    success = run_command(
        "source venv/bin/activate && DATABASE_URL=postgresql+psycopg://postgres:3891123@localhost:5432/medical_application alembic upgrade head",
        "Обновление миграций до последней версии"
    )
    
    # Удаляем временный файл
    os.remove(".env.docker")
    
    if success:
        # Проверяем результат
        run_command(
            "docker exec medical_tests_db psql -U postgres -d medical_application -c 'SELECT * FROM alembic_version;'",
            "Проверка обновленной версии"
        )
        
        # Проверяем таблицы
        run_command(
            "docker exec medical_tests_db psql -U postgres -d medical_application -c '\dt'",
            "Проверка таблиц после обновления"
        )
    
    return success

def fix_local_migrations():
    """Исправить локальные миграции"""
    print("\n" + "="*60)
    print("🔧 ИСПРАВЛЕНИЕ ЛОКАЛЬНЫХ МИГРАЦИЙ")
    print("="*60)
    
    # Проверяем, есть ли локальная PostgreSQL
    print("\n📊 Проверка локальной PostgreSQL...")
    
    # Пытаемся подключиться к локальной БД
    result = subprocess.run(
        "psql -U postgres -d medical_application -c 'SELECT version();'",
        shell=True, capture_output=True, text=True
    )
    
    if result.returncode != 0:
        print("⚠️  Локальная PostgreSQL недоступна")
        print("💡 Рекомендации:")
        print("   1. Установите PostgreSQL локально")
        print("   2. Создайте базу данных: createdb -U postgres medical_application")
        print("   3. Или используйте только Docker для разработки")
        return False
    
    print("✅ Локальная PostgreSQL доступна")
    
    # Обновляем локальные миграции
    success = run_command(
        "source venv/bin/activate && alembic upgrade head",
        "Обновление локальных миграций"
    )
    
    if success:
        # Проверяем результат
        run_command(
            "source venv/bin/activate && alembic current",
            "Проверка текущей версии"
        )
        
        run_command(
            "source venv/bin/activate && alembic check",
            "Проверка состояния миграций"
        )
    
    return success

def create_migration_guide():
    """Создать руководство по миграциям"""
    print("\n" + "="*60)
    print("📚 СОЗДАНИЕ РУКОВОДСТВА ПО МИГРАЦИЯМ")
    print("="*60)
    
    guide_content = """# Руководство по миграциям

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
docker exec medical_tests_db psql -U postgres -d medical_application -c '\\dt'
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
"""
    
    with open("MIGRATION_GUIDE.md", "w") as f:
        f.write(guide_content)
    
    print("✅ Создано руководство: MIGRATION_GUIDE.md")

def main():
    """Основная функция"""
    print("🚀 ИСПРАВЛЕНИЕ ПРОБЛЕМ С МИГРАЦИЯМИ")
    print("="*60)
    
    # Исправляем Docker миграции
    docker_ok = fix_docker_migrations()
    
    # Исправляем локальные миграции
    local_ok = fix_local_migrations()
    
    # Создаем руководство
    create_migration_guide()
    
    # Итоговый результат
    print("\n" + "="*60)
    print("📋 ИТОГОВЫЙ РЕЗУЛЬТАТ")
    print("="*60)
    
    if docker_ok:
        print("✅ Docker миграции: ИСПРАВЛЕНЫ")
    else:
        print("❌ Docker миграции: ПРОБЛЕМЫ")
    
    if local_ok:
        print("✅ Локальные миграции: ИСПРАВЛЕНЫ")
    else:
        print("⚠️  Локальные миграции: ТРЕБУЮТ НАСТРОЙКИ")
    
    print("\n📚 Создано руководство: MIGRATION_GUIDE.md")
    print("\n💡 Для проверки запустите: python3 check_migrations.py")

if __name__ == "__main__":
    main()
