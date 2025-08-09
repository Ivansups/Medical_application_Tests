from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import logging
from ..models.questions import Question
from ..models.test import Test
from app.schemas.test import TestCreate

# Настройка логирования
logger = logging.getLogger(__name__)

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID

def delete_test_by_id(db: Session, test_id: UUID):
    try:
        test = db.query(Test).filter(Test.id == test_id).first()
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND
                detail="Тест не найден!!!"
            )
        db.delete(test)
        db.commit()
        return{"message": f"Задача {test.id} удалена!"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            detail=f"Ошибка базы данных: {str(e)}"
        )

def delete_all_tests(db: Session):
    try:
        db.query(Question).delete()
        deleted_count = db.query(Test).delete()
        db.commit()
        return {
            "message": "Все тесты удалены",
            "deleted_tests": deleted_count
        }        
    except SQLAlchemyError as e:
        db.rollback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            detail=f"Ошибка базы данных: {str(e)}"            
        )

def get_tests(db: Session, skip: int = 0, limit: int = 10):
    """Получение списка тестов с пагинацией"""
    return db.query(Test).order_by(Test.created_at.desc()).offset(skip).limit(limit).all()

def create_test(db: Session, test_data: TestCreate):
    """Создание нового теста с вопросами"""
    logger.info(f"Starting test creation with title: {test_data.title}")
    
    # Валидация вопросов
    for i, question in enumerate(test_data.questions):
        logger.info(f"Validating question {i+1}: type={question.question_type}, has_options={question.options is not None}, answer={question.answer}")
        
        # Для вопросов с выбором проверяем индексы
        if question.question_type in ["single_choice", "multiple_choice"]:
            if not question.options:
                logger.error(f"Question {i+1}: missing options for choice question")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Вопрос {i+1}: для типа '{question.question_type}' должны быть варианты ответа"
                )
                
            if question.answer:
                max_index = len(question.options) - 1
                invalid_indices = [idx for idx in question.answer if idx > max_index or idx < 0]
                
                if invalid_indices:
                    logger.error(f"Question {i+1}: invalid answer indices {invalid_indices}, max allowed: {max_index}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Вопрос {i+1}: недопустимые индексы ответов {invalid_indices}"
                    )
        
        # Для открытых вопросов
        elif question.question_type == "open_ended":
            if question.options:
                logger.error(f"Question {i+1}: open ended question should not have options")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Вопрос {i+1}: для открытых вопросов не должно быть вариантов ответа"
                )
    
    logger.info("All questions validated successfully")
    
    try:
        # Создаем тест
        test_obj = Test(
            title=test_data.title,
            description=test_data.description,
            duration=test_data.duration
        )
        db.add(test_obj)
        db.flush()  # Получаем ID без коммита
        logger.info(f"Test object created with ID: {test_obj.id}")
        
        # Создаем вопросы
        questions = [
            Question(
                test_id=test_obj.id,
                question_text=q.question_text,
                options=q.options,
                correct_answers=q.answer,
                question_type=q.question_type
            )
            for i, q in enumerate(test_data.questions)
        ]
        
        db.bulk_save_objects(questions)
        db.commit()
        db.refresh(test_obj)  # Обновляем объект после коммита
        logger.info(f"Test and questions saved successfully")
        
        return test_obj
    
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нарушение целостности данных: возможно дубликат ID"
        )
    
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"SQLAlchemy error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка базы данных: {str(e)}"
        )
    
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Непредвиденная ошибка: {str(e)}"
        )

def get_test_by_id(db: Session, test_id: str):
    """Получение теста по ID с вопросами"""
    test = db.query(Test).filter(Test.id == test_id).first()
    
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    # Явная загрузка вопросов
    test.questions = db.query(Question).filter(Question.test_id == test_id).all()
    
    return test