#!/usr/bin/env python3
"""
Скрипт для проверки миграций в локальной среде и Docker
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Выполнить команду и вывести результат"""
    print(f"\n🔍 {description}")
    print(f"Команда: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Успешно!")
            if result.stdout.strip():
                print(f"Вывод: {result.stdout.strip()}")
        else:
            print("❌ Ошибка!")
            print(f"Ошибка: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ Исключение: {e}")
        return False
    
    return True

def check_local_migrations():
    """Проверить миграции в локальной среде"""
    print("\n" + "="*60)
    print("🔧 ПРОВЕРКА МИГРАЦИЙ В ЛОКАЛЬНОЙ СРЕДЕ")
    print("="*60)
    
    # Проверяем, что мы в правильной директории
    if not os.path.exists("alembic.ini"):
        print("❌ Файл alembic.ini не найден. Перейдите в директорию backend/")
        return False
    
    # Проверяем виртуальное окружение
    if not os.path.exists("venv"):
        print("❌ Виртуальное окружение не найдено. Создайте venv/")
        return False
    
    # Активируем виртуальное окружение и проверяем импорты
    success = run_command(
        "source venv/bin/activate && python -c 'from app.db.models import *; print(\"Models imported successfully\")'",
        "Проверка импорта моделей"
    )
    
    if not success:
        return False
    
    # Проверяем текущую версию миграций
    success = run_command(
        "source venv/bin/activate && alembic current",
        "Текущая версия миграций"
    )
    
    if not success:
        return False
    
    # Проверяем историю миграций
    success = run_command(
        "source venv/bin/activate && alembic history --verbose",
        "История миграций"
    )
    
    if not success:
        return False
    
    # Проверяем, есть ли невыполненные миграции
    success = run_command(
        "source venv/bin/activate && alembic check",
        "Проверка состояния миграций"
    )
    
    return success

def check_docker_migrations():
    """Проверить миграции в Docker"""
    print("\n" + "="*60)
    print("🐳 ПРОВЕРКА МИГРАЦИЙ В DOCKER")
    print("="*60)
    
    # Проверяем, что Docker запущен
    success = run_command(
        "docker --version",
        "Проверка Docker"
    )
    
    if not success:
        return False
    
    # Проверяем, что контейнеры запущены
    success = run_command(
        "docker ps --filter name=medical_tests",
        "Проверка запущенных контейнеров"
    )
    
    if not success:
        return False
    
    # Проверяем подключение к базе данных в Docker
    success = run_command(
        "docker exec medical_tests_db psql -U postgres -d medical_application -c 'SELECT version();'",
        "Проверка подключения к БД в Docker"
    )
    
    if not success:
        return False
    
    # Проверяем таблицы в базе данных
    success = run_command(
        "docker exec medical_tests_db psql -U postgres -d medical_application -c '\dt'",
        "Проверка таблиц в БД"
    )
    
    return success

def check_migration_files():
    """Проверить файлы миграций"""
    print("\n" + "="*60)
    print("📁 ПРОВЕРКА ФАЙЛОВ МИГРАЦИЙ")
    print("="*60)
    
    migrations_dir = Path("alembic/versions")
    if not migrations_dir.exists():
        print("❌ Директория миграций не найдена")
        return False
    
    migration_files = list(migrations_dir.glob("*.py"))
    print(f"📊 Найдено файлов миграций: {len(migration_files)}")
    
    # Проверяем основные файлы
    required_files = [
        "alembic.ini",
        "alembic/env.py",
        "alembic/script.py.mako"
    ]
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - не найден")
            return False
    
    return True

def check_database_connection():
    """Проверить подключение к базе данных"""
    print("\n" + "="*60)
    print("🔌 ПРОВЕРКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ")
    print("="*60)
    
    # Проверяем переменные окружения
    env_vars = [
        "DATABASE_URL",
        "POSTGRES_USER", 
        "POSTGRES_PASSWORD",
        "POSTGRES_DB",
        "POSTGRES_HOST",
        "POSTGRES_PORT"
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if value:
            # Скрываем пароль
            if "PASSWORD" in var:
                value = "***"
            print(f"✅ {var}: {value}")
        else:
            print(f"⚠️  {var}: не установлена")
    
    return True

def main():
    """Основная функция"""
    print("🚀 ПРОВЕРКА МИГРАЦИЙ ДЛЯ СИСТЕМЫ ТЕСТИРОВАНИЯ")
    print("="*60)
    
    # Проверяем файлы миграций
    if not check_migration_files():
        print("\n❌ Проблемы с файлами миграций")
        return
    
    # Проверяем подключение к БД
    if not check_database_connection():
        print("\n❌ Проблемы с подключением к БД")
        return
    
    # Проверяем локальные миграции
    local_ok = check_local_migrations()
    
    # Проверяем Docker миграции
    docker_ok = check_docker_migrations()
    
    # Итоговый результат
    print("\n" + "="*60)
    print("📋 ИТОГОВЫЙ РЕЗУЛЬТАТ")
    print("="*60)
    
    if local_ok:
        print("✅ Локальные миграции: ОК")
    else:
        print("❌ Локальные миграции: ПРОБЛЕМЫ")
    
    if docker_ok:
        print("✅ Docker миграции: ОК")
    else:
        print("❌ Docker миграции: ПРОБЛЕМЫ")
    
    if local_ok and docker_ok:
        print("\n🎉 Все проверки пройдены успешно!")
    else:
        print("\n⚠️  Есть проблемы, которые нужно исправить")

if __name__ == "__main__":
    main()
