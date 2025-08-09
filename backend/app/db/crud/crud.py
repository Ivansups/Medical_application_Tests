from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.questions import Question
from ..models.user import User
from ..models.test import Test
from app.schemas.test import TestCreate

def get_tests(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Test).offset(skip).limit(limit).all()

def create_test(test_data: TestCreate, db: Session):
    # Создаем тест
    test = Test(
        test_id=test_data.test_id,
        title=test_data.title,
        description=test_data.description,
        duration=test_data.duration
    )
    
    db.add(test)
    db.commit()
    db.refresh(test)
    
    # Создаем вопросы для теста
    for q in test_data.questions:
        db_question = Question(
            test_id=test.id,
            question_text=q.question_txt,
            options=q.options,
            correct_answers=q.answer,
            question_type=q.question_type
        )
        db.add(db_question)
    
    db.commit()
    return test

def get_test_by_id(db: Session, test_id: str):
    return db.query(Test).filter(Test.id == test_id).first()