from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class TestResult(Base):
    __tablename__ = 'test_results'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey('tests.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    result_data = Column(JSON, nullable=False)
    