from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from uuid import UUID  # Добавлен импорт UUID

from app.api.dependencies import get_db
from app.schemas.test import TestCreate, TestOut  # Добавлен TestOut для документации
from app.db.crud.crud import delete_all_tests, delete_test_by_id, get_tests, create_test, get_test_by_id

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.delete("/tests/{test_id}", response_model=dict)
def delete_test_endpoint(test_id: UUID, db: Session = Depends(get_db)):
    try:
        return delete_test_by_id(db, test_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting test: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/tests/", response_model=dict)
def delete_all_tests_endpoint(db: Session = Depends(get_db)):
    try:
        return delete_all_tests(db)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting all tests: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/tests", response_model=List[TestOut])
def get_all_tests_endpoint(db: Session = Depends(get_db), skip: int = 0, limit: int = 10):
    try:
        return get_tests(db, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error fetching tests: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/tests", response_model=TestOut, status_code=201)
def create_new_test_endpoint(test: TestCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating new test: '{test.title}' with {len(test.questions)} questions")
    
    for i, question in enumerate(test.questions):
        logger.debug(f"Question {i+1}: {question.question_text[:50]}...")
    
    try:
        result = create_test(db=db, test_data=test)
        logger.info(f"Test created successfully: {result.id}")
        return result
    except HTTPException as e:
        logger.error(f"Validation error: {e.detail}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/tests/{test_id}", response_model=TestOut)
def get_test_by_id_endpoint(test_id: UUID, db: Session = Depends(get_db)):
    try:
        db_test = get_test_by_id(db, test_id=test_id)
        if not db_test:
            raise HTTPException(status_code=404, detail="Test not found")
        return db_test
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching test {test_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")