from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.db.models.test import Test
from app.db.models.questions import Question
from app.schemas.test import TestCreate
from app.exceptions import NotFoundException
import logging

logger = logging.getLogger(__name__)

def create_test_with_questions(db: Session, payload: TestCreate) -> Test:
    try:
        test = Test(
            title=payload.title,
            description=payload.description,
            duration=payload.duration,
            is_active=payload.is_active
        )
        db.add(test)
        db.flush()
        questions = []
        for q in payload.questions:
            question = Question(
                test_id = test.id,
                question_text = q.question_text,
                options = q.options,
                correct_answers = q.correct_answers,
                question_type = q.question_type
            )
            questions.append(question)
        db.bulk_save_objects(questions)
        db.commit()
        db.refresh(test)
        logger.info(f"Test created successfully: {test.id}")
        return test
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нарушение целостности данных"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера"
        )
def find_test_by_title(db: Session, title_o: str, limit: int = 20):
    return(
        db.query(Test)
        .filter(Test.title.ilike(f"%{title_o}%"))
        .order_by(Test.created_at.desc())
        .limit(limit)
        .all()
    )
def get_tests_with_pagination(db: Session, skip: int = 0, limit: int = 10):
    total = db.query(Test).count()
    tests = (
        db.query(Test)
        .order_by(Test.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "tests": tests,
        "total": total,
        "skip": skip,
        "limit": limit
    }

def get_test_by_id(db: Session, test_id: str) -> Test:
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise NotFoundException(f"Тест с ID {test_id} не найден")
    return test