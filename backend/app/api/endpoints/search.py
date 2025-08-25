from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.schemas.test import TestCreate
from app.services.test_service import find_test_by_title, get_tests_with_pagination
from app.db.session import get_db

router = APIRouter()

@router.get('/tests/search', response_model=List[TestCreate])
def search_tests(
    q: str = Query(..., description="Поисковый запрос"),
    db: Session = Depends(get_db),
    description="Search tests by title"
):
    if not q.strip():
        raise HTTPException(status_code=400, detail='Поисковый запрос не может быть пустым')
    tests = find_test_by_title(db, q.strip())
    return tests

@router.get('/tests/paginated')
def get_tests_paginated(
    skip: int = Query(0, ge=0, description="Количество пропущенных записей"),
    limit: int = Query(10, ge=1, le=100, description="Количество записей на странице"),
    db: Session = Depends(get_db),
    description="Get tests with pagination"
):
    return get_tests_with_pagination(db, skip=skip, limit=limit)