from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.schemas.test import TestCreate
from app.db.crud.crud import get_tests, create_test, get_test_by_id

router = APIRouter()

@router.get("/tests")
def get_all_tests(db: Session = Depends(get_db), skip: int = 0, limit: int = 10):
    tests = get_tests(db, skip=skip, limit=limit)
    return tests

@router.post("/tests")
def create_new_test(test: TestCreate, db: Session = Depends(get_db)):
    return create_test(test_data=test, db=db)

@router.get("/tests/{test_id}")
def get_test_by_id_endpoint(test_id: str, db: Session = Depends(get_db)):
    db_test = get_test_by_id(db, test_id=test_id)
    if db_test is None:
        raise HTTPException(status_code=404, detail="Test not found")
    return db_test
