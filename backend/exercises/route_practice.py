"""
Упражнения для обучения написанию роутов в FastAPI

Задача: Написать правильные роуты для системы тестирования студентов.

Что нужно знать:
1. Структура роута
2. Валидация входных данных
3. Обработка ошибок
4. Возврат правильных ответов
5. Документация API
6. Все типы HTTP запросов (GET, POST, PUT, DELETE, PATCH)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import logging
from datetime import datetime

# Импорты для работы с БД
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.db.models import User, Test, TestAttempt, UserAnswer, Question

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["test-system"])

# ============================================================================
# ЗАДАЧА 1: GET запросы (получение данных)
# ============================================================================

@router.get("/tests", description="Получить список всех тестов")
async def get_tests(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить список тестов с пагинацией
    
    Args:
        skip: Количество записей для пропуска
        limit: Максимальное количество записей
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Список тестов
    """
    # TODO: Напишите код здесь
    pass

@router.get("/tests/{test_id}", description="Получить информацию о тесте")
async def get_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить информацию о конкретном тесте
    
    Args:
        test_id: ID теста
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Информация о тесте
    
    Raises:
        HTTPException: Если тест не найден
    """
    # TODO: Напишите код здесь
    pass

@router.get("/users/me", description="Получить информацию о текущем пользователе")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Получить информацию о текущем авторизованном пользователе
    
    Args:
        current_user: Текущий пользователь
    
    Returns:
        Информация о пользователе
    """
    # TODO: Напишите код здесь
    pass

@router.get("/attempts/{attempt_id}", description="Получить информацию о попытке")
async def get_attempt(
    attempt_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Получить информацию о попытке прохождения теста
    
    Args:
        attempt_id: ID попытки
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Информация о попытке
    
    Raises:
        HTTPException: Если попытка не найдена или не принадлежит пользователю
    """
    # TODO: Напишите код здесь
    pass

# ============================================================================
# ЗАДАЧА 2: POST запросы (создание данных)
# ============================================================================

@router.post("/tests", description="Создать новый тест")
async def create_test(
    title: str,
    description: str,
    duration: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создать новый тест (только для учителей и админов)
    
    Args:
        title: Название теста
        description: Описание теста
        duration: Длительность в минутах
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Созданный тест
    
    Raises:
        HTTPException: Если нет прав или ошибка создания
    """
    # TODO: Напишите код здесь
    pass

@router.post("/tests/{test_id}/start", description="Начать прохождение теста")
async def start_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Начать прохождение теста (создать попытку)
    
    Args:
        test_id: ID теста
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Информация о созданной попытке
    
    Raises:
        HTTPException: Если тест не найден или уже начат
    """
    # TODO: Напишите код здесь
    pass

@router.post("/attempts/{attempt_id}/submit-answer", description="Отправить ответ на вопрос")
async def submit_answer(
    attempt_id: UUID,
    question_id: UUID,
    answer_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Отправить ответ на вопрос
    
    Args:
        attempt_id: ID попытки
        question_id: ID вопроса
        answer_data: Данные ответа
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Информация о сохраненном ответе
    
    Raises:
        HTTPException: Если попытка/вопрос не найдены
    """
    # TODO: Напишите код здесь
    pass

# ============================================================================
# ЗАДАЧА 3: PUT запросы (полное обновление данных)
# ============================================================================

@router.put("/tests/{test_id}", description="Обновить тест полностью")
async def update_test(
    test_id: UUID,
    title: str,
    description: str,
    duration: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Полностью обновить тест (только для учителей и админов)
    
    Args:
        test_id: ID теста
        title: Новое название
        description: Новое описание
        duration: Новая длительность
        is_active: Активен ли тест
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Обновленный тест
    
    Raises:
        HTTPException: Если тест не найден или нет прав
    """
    # TODO: Напишите код здесь
    pass

@router.put("/users/me", description="Обновить профиль пользователя")
async def update_user_profile(
    name: str,
    email: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновить профиль текущего пользователя
    
    Args:
        name: Новое имя
        email: Новый email
        current_user: Текущий пользователь
        db: Сессия базы данных
    
    Returns:
        Обновленный пользователь
    
    Raises:
        HTTPException: Если email уже занят
    """
    # TODO: Напишите код здесь
    pass

# ============================================================================
# ЗАДАЧА 4: PATCH запросы (частичное обновление данных)
# ============================================================================

@router.patch("/tests/{test_id}/activate", description="Активировать тест")
async def activate_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Активировать тест (установить is_active = True)
    
    Args:
        test_id: ID теста
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Обновленный тест
    
    Raises:
        HTTPException: Если тест не найден или нет прав
    """
    # TODO: Напишите код здесь
    pass

@router.patch("/tests/{test_id}/deactivate", description="Деактивировать тест")
async def deactivate_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Деактивировать тест (установить is_active = False)
    
    Args:
        test_id: ID теста
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Обновленный тест
    
    Raises:
        HTTPException: Если тест не найден или нет прав
    """
    # TODO: Напишите код здесь
    pass

@router.patch("/attempts/{attempt_id}/pause", description="Приостановить попытку")
async def pause_attempt(
    attempt_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Приостановить попытку прохождения теста
    
    Args:
        attempt_id: ID попытки
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Обновленная попытка
    
    Raises:
        HTTPException: Если попытка не найдена или уже завершена
    """
    # TODO: Напишите код здесь
    pass

# ============================================================================
# ЗАДАЧА 5: DELETE запросы (удаление данных)
# ============================================================================

@router.delete("/tests/{test_id}", description="Удалить тест")
async def delete_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Удалить тест (только для админов)
    
    Args:
        test_id: ID теста
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Сообщение об успешном удалении
    
    Raises:
        HTTPException: Если тест не найден или нет прав
    """
    # TODO: Напишите код здесь
    pass

@router.delete("/attempts/{attempt_id}", description="Отменить попытку")
async def cancel_attempt(
    attempt_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Отменить попытку прохождения теста
    
    Args:
        attempt_id: ID попытки
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Сообщение об успешной отмене
    
    Raises:
        HTTPException: Если попытка не найдена или уже завершена
    """
    # TODO: Напишите код здесь
    pass

@router.delete("/users/me", description="Удалить аккаунт")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Удалить аккаунт текущего пользователя
    
    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных
    
    Returns:
        Сообщение об успешном удалении
    
    Raises:
        HTTPException: Если есть активные попытки
    """
    # TODO: Напишите код здесь
    pass

# ============================================================================
# ЗАДАЧА 6: Сложные роуты (комбинированные операции)
# ============================================================================

@router.post("/attempts/{attempt_id}/finish", description="Завершить прохождение теста")
async def finish_test(
    attempt_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Завершить прохождение теста (вычислить результаты)
    
    Args:
        attempt_id: ID попытки
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Результаты теста
    
    Raises:
        HTTPException: Если попытка не найдена или уже завершена
    """
    # TODO: Напишите код здесь
    pass

@router.post("/tests/{test_id}/duplicate", description="Дублировать тест")
async def duplicate_test(
    test_id: UUID,
    new_title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создать копию существующего теста
    
    Args:
        test_id: ID исходного теста
        new_title: Новое название для копии
        db: Сессия базы данных
        current_user: Текущий пользователь
    
    Returns:
        Созданная копия теста
    
    Raises:
        HTTPException: Если исходный тест не найден или нет прав
    """
    # TODO: Напишите код здесь
    pass

# ============================================================================
# ПОДСКАЗКИ ПО СТРУКТУРЕ РОУТА
# ============================================================================

# СТРУКТУРА ПРАВИЛЬНОГО РОУТА:
#
# 1. ДЕКОРАТОР с методом и путем
# @router.get("/path")
# @router.post("/path")
# @router.put("/path")
# @router.patch("/path")
# @router.delete("/path")
#
# 2. АСИНХРОННАЯ ФУНКЦИЯ с параметрами
# async def function_name(
#     param1: type,
#     param2: type = default_value,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#
# 3. ДОКУМЕНТАЦИЯ (docstring)
#     """
#     Описание что делает роут
#     """
#
# 4. ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ
#     if not param1:
#         raise HTTPException(status_code=400, detail="Ошибка валидации")
#
# 5. ПРОВЕРКА ПРАВ ДОСТУПА
#     if current_user.role not in ["teacher", "admin"]:
#         raise HTTPException(status_code=403, detail="Недостаточно прав")
#
# 6. БИЗНЕС-ЛОГИКА
#     try:
#         # Основная логика
#         result = do_something()
#         return result
#     except Exception as e:
#         logger.error(f"Error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Внутренняя ошибка")
#
# 7. ОБРАБОТКА ОШИБОК
#     if not result:
#         raise HTTPException(status_code=404, detail="Не найдено")
#
# 8. ВОЗВРАТ РЕЗУЛЬТАТА
#     return {"message": "Успешно", "data": result}
#
# ПРИМЕРЫ HTTP КОДОВ:
# - 200: OK (успешно)
# - 201: Created (создано)
# - 400: Bad Request (ошибка валидации)
# - 401: Unauthorized (не авторизован)
# - 403: Forbidden (нет прав)
# - 404: Not Found (не найдено)
# - 409: Conflict (конфликт)
# - 500: Internal Server Error (ошибка сервера)
#
# РАЗНИЦА МЕЖДУ HTTP МЕТОДАМИ:
# - GET: Получение данных (безопасный, идемпотентный)
# - POST: Создание новых данных
# - PUT: Полное обновление данных (идемпотентный)
# - PATCH: Частичное обновление данных
# - DELETE: Удаление данных (идемпотентный)

# ============================================================================
# ПРИМЕРЫ ПРАВИЛЬНЫХ РОУТОВ
# ============================================================================

# ПРИМЕР 1: GET роут
#
# @router.get("/users/{user_id}")
# async def get_user(
#     user_id: UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Пользователь не найден"
#         )
#     return user
#
# ПРИМЕР 2: POST роут с валидацией
#
# @router.post("/tests")
# async def create_test(
#     title: str,
#     description: str,
#     duration: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # Проверка прав
#     if current_user.role not in ["teacher", "admin"]:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Только учителя и админы могут создавать тесты"
#         )
#     
#     # Валидация данных
#     if not title or len(title) < 3:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Название должно содержать минимум 3 символа"
#         )
#     
#     try:
#         test = Test(
#             title=title,
#             description=description,
#             duration=duration,
#             created_by=current_user.id
#         )
#         db.add(test)
#         db.commit()
#         db.refresh(test)
#         return test
#     except Exception as e:
#         db.rollback()
#         logger.error(f"Error creating test: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Ошибка при создании теста"
#         )
#
# ПРИМЕР 3: PUT роут (полное обновление)
#
# @router.put("/tests/{test_id}")
# async def update_test(
#     test_id: UUID,
#     title: str,
#     description: str,
#     duration: int,
#     is_active: bool,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # Проверка прав
#     if current_user.role not in ["teacher", "admin"]:
#         raise HTTPException(status_code=403, detail="Недостаточно прав")
#     
#     # Поиск теста
#     test = db.query(Test).filter(Test.id == test_id).first()
#     if not test:
#         raise HTTPException(status_code=404, detail="Тест не найден")
#     
#     try:
#         # Полное обновление всех полей
#         test.title = title
#         test.description = description
#         test.duration = duration
#         test.is_active = is_active
#         
#         db.commit()
#         db.refresh(test)
#         return test
#     except Exception as e:
#         db.rollback()
#         logger.error(f"Error updating test: {str(e)}")
#         raise HTTPException(status_code=500, detail="Ошибка при обновлении")
#
# ПРИМЕР 4: PATCH роут (частичное обновление)
#
# @router.patch("/tests/{test_id}/activate")
# async def activate_test(
#     test_id: UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if current_user.role not in ["teacher", "admin"]:
#         raise HTTPException(status_code=403, detail="Недостаточно прав")
#     
#     test = db.query(Test).filter(Test.id == test_id).first()
#     if not test:
#         raise HTTPException(status_code=404, detail="Тест не найден")
#     
#     try:
#         # Только одно поле
#         test.is_active = True
#         db.commit()
#         db.refresh(test)
#         return test
#     except Exception as e:
#         db.rollback()
#         logger.error(f"Error activating test: {str(e)}")
#         raise HTTPException(status_code=500, detail="Ошибка при активации")
#
# ПРИМЕР 5: DELETE роут
#
# @router.delete("/tests/{test_id}")
# async def delete_test(
#     test_id: UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if current_user.role != "admin":
#         raise HTTPException(status_code=403, detail="Только админы могут удалять тесты")
#     
#     test = db.query(Test).filter(Test.id == test_id).first()
#     if not test:
#         raise HTTPException(status_code=404, detail="Тест не найден")
#     
#     try:
#         db.delete(test)
#         db.commit()
#         return {"message": f"Тест '{test.title}' успешно удален"}
#     except Exception as e:
#         db.rollback()
#         logger.error(f"Error deleting test: {str(e)}")
#         raise HTTPException(status_code=500, detail="Ошибка при удалении")

# ============================================================================
# ПРОВЕРКА РЕШЕНИЙ
# ============================================================================

def test_routes():
    """
    Функция для проверки ваших роутов
    """
    print("=== Тестирование роутов ===")
    print("1. Проверьте структуру роутов")
    print("2. Проверьте обработку ошибок")
    print("3. Проверьте валидацию данных")
    print("4. Проверьте проверку прав доступа")
    print("5. Проверьте документацию")
    print("6. Проверьте все типы HTTP запросов")
    print("=== Тестирование завершено ===")

if __name__ == "__main__":
    test_routes()
