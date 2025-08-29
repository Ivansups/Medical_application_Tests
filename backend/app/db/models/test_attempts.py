from sqlalchemy import Column, ForeignKey, Integer, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from .base import Base

class TestAttempt(Base):
    __tablename__ = 'test_attempts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True) # Ссылется на пользователя по ID
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id"), nullable=False, index=True) # Ссылется на тест по ID
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    score = Column(Integer, nullable=True)
    max_score = Column(Integer, nullable=True)
    status = Column(String(20), default='in_progress')  # in_progress, completed, abandoned

    # Relationships
    user = relationship("User", back_populates="test_attempts")
    test = relationship("Test", back_populates="attempts")
    answers = relationship("UserAnswer", back_populates="attempt", cascade="all, delete-orphan")