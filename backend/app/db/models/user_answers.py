from sqlalchemy import JSON, Boolean, Column, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class UserAnswer(Base):
    __tablename__ = 'user_answers'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("test_attempts.id"), nullable=False) # Тут прописываем связь с таблицей test_attempts
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False) # Тут прописываем связь с таблицей questions
    answer_data = Column(JSON)
    is_correct = Column(Boolean, default=False)
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)