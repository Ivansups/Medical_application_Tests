from typing import Generator
from sqlalchemy.orm import Session
from app.db.session import get_db as get_db_session

def get_db() -> Generator[Session, None, None]:
    yield from get_db_session()
