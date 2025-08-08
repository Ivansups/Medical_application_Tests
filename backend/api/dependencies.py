from sqlalchemy.orm import Session
from app.db.session import get_db as get_db_session

def get_db() -> Session:
    return get_db_session()
