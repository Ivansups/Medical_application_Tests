#!/usr/bin/env python3
"""
Тестовый скрипт для проверки функций аутентификации
"""

from app.core.auth import (
    create_access_token,
    verify_password,
    get_password_hash,
    authenticate_user,
    create_user
)
from app.db.session import get_db
from app.db.models.user import User
from datetime import timedelta
import sqlalchemy as sa

def test_password_hashing():
    """Тест хеширования паролей"""
    print("🔐 Тестирование хеширования паролей...")
    
    password = "test_password_123"
    hashed = get_password_hash(password)
    
    print(f"   Пароль: {password}")
    print(f"   Хеш: {hashed[:50]}...")
    
    # Проверяем, что пароль правильно верифицируется
    is_valid = verify_password(password, hashed)
    print(f"   Верификация: {'✅' if is_valid else '❌'}")
    
    # Проверяем, что неправильный пароль не проходит
    is_invalid = verify_password("wrong_password", hashed)
    print(f"   Неправильный пароль: {'❌' if not is_invalid else '✅'}")
    
    return is_valid and not is_invalid

def test_jwt_token():
    """Тест создания JWT токенов"""
    print("\n🎫 Тестирование JWT токенов...")
    
    data = {"sub": "test@example.com"}
    token = create_access_token(data)
    
    print(f"   Данные: {data}")
    print(f"   Токен: {token[:50]}...")
    
    # Проверяем, что токен создался
    if token and len(token) > 50:
        print("   ✅ Токен создан успешно")
        return True
    else:
        print("   ❌ Ошибка создания токена")
        return False

def test_database_connection():
    """Тест подключения к базе данных"""
    print("\n🗄️ Тестирование подключения к базе данных...")
    
    try:
        db = next(get_db())
        print("   ✅ Подключение к базе данных успешно")
        
        # Проверяем, что можем выполнить простой запрос
        result = db.execute(sa.text("SELECT 1")).scalar()
        if result == 1:
            print("   ✅ Запрос к базе данных выполнен успешно")
            db.close()
            return True
        else:
            print("   ❌ Ошибка выполнения запроса")
            db.close()
            return False
            
    except Exception as e:
        print(f"   ❌ Ошибка подключения к базе данных: {e}")
        return False

def test_user_creation():
    """Тест создания пользователя"""
    print("\n👤 Тестирование создания пользователя...")
    
    try:
        db = next(get_db())
        
        # Создаем тестового пользователя
        test_email = "test_auth@example.com"
        test_password = "test_password_123"
        
        # Проверяем, не существует ли уже такой пользователь
        existing_user = db.query(User).filter(User.email == test_email).first()
        if existing_user:
            print(f"   ⚠️ Пользователь {test_email} уже существует")
            db.close()
            return True
        
        # Создаем пользователя
        user = create_user(db, test_email, test_password)
        
        if user and user.email == test_email:
            print(f"   ✅ Пользователь создан: {user.email}")
            
            # Проверяем аутентификацию
            auth_user = authenticate_user(db, test_email, test_password)
            if auth_user:
                print(f"   ✅ Аутентификация успешна: {auth_user.email}")
            else:
                print("   ❌ Ошибка аутентификации")
            
            db.close()
            return auth_user is not None
        else:
            print("   ❌ Ошибка создания пользователя")
            db.close()
            return False
            
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Запуск тестов аутентификации...\n")
    
    tests = [
        ("Хеширование паролей", test_password_hashing),
        ("JWT токены", test_jwt_token),
        ("Подключение к БД", test_database_connection),
        ("Создание пользователя", test_user_creation),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"   ❌ Ошибка в тесте '{test_name}': {e}")
            results.append((test_name, False))
    
    # Выводим итоговые результаты
    print("\n" + "="*50)
    print("📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ ПРОЙДЕН" if result else "❌ ПРОВАЛЕН"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n   Итого: {passed}/{total} тестов пройдено")
    
    if passed == total:
        print("   🎉 Все тесты пройдены! Система аутентификации работает корректно.")
    else:
        print("   ⚠️ Некоторые тесты не пройдены. Проверьте настройки.")
    
    return passed == total

if __name__ == "__main__":
    main()
