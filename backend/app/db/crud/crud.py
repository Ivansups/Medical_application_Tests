from sqlalchemy.orm import Session
from ..models.test import Test

def get_tests(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Test).offset(skip).limit(limit).all()

def create_test(db: Session, test: Test):
    db.add(test)
    db.commit()
    db.refresh(test)
    return test
def get_test_by_id(db: Session, test_id: str):
    return db.query(Test).filter(Test.id == test_id).first()

def update_test(db: Session, test_id: str, test: Test):
    db_test = get_test_by_id(db, test_id)
    if not db_test:
        return None
    db_test.title = test.title
    db_test.description = test.description
    db_test.duration = test.duration
def delete_test(db: Session, test_id: str):
    db_test = get_test_by_id(db, test_id)
    if not db_test:
        return None
    db.delete(db_test)
    db.commit()
    return db_test