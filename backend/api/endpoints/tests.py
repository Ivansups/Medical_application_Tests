from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..dependencies import get_db
from app.schemas import test as schemas
from app.db.crud import crud

router = APIRouter()

@router.get("/tests_all_tests", response_model=List[schemas.Test])
def get_tests(db: Session = Depends(get_db), skip: int = 0, limit: int = 10):
    tests = crud.get_tests(db, skip=skip, limit=limit)
    return tests

@router.post("/tests", response_model=schemas.Test)
def create_test(test: schemas.TestCreate, db: Session = Depends(get_db)):
    return crud.create_test(db=db, test=test)

@router.get("/tests/{test_id}", response_model=schemas.Test)
def get_test_by_id(test_id: str, db: Session = Depends(get_db)):
    db_test = crud.get_test_by_id(db, test_id=test_id)
    if db_test is None:
        raise HTTPException(status_code=404, detail="Test not found")
    return db_test

@router.put("/tests/{test_id}", response_model=schemas.Test)
def update_test(test_id: str, test: schemas.TestCreate, db: Session = Depends(get_db)):
    db_test = crud.update_test(db, test_id=test_id, test=test)