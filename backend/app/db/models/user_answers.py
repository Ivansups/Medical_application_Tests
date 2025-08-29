from sqlalchemy import JSON, Boolean, Column, ForeignKey, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from .base import Base

class UserAnswer(Base):
    __tablename__ = 'user_answers'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("test_attempts.id"), nullable=False, index=True)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False, index=True)
    selected_options = Column(JSON, nullable=True)  # Индексы выбранных вариантов [0, 2]
    text_answer = Column(Text, nullable=True)  # Для текстовых ответов
    is_correct = Column(Boolean, nullable=True)
    points_earned = Column(Integer, default=0)
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    attempt = relationship("TestAttempt", back_populates="answers")
    question = relationship("Question", back_populates="user_answers")