from sqlalchemy import Column, String, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class Question(Base):
    __tablename__ = 'questions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey('tests.id'), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSON)  # Храним как JSON для списков
    correct_answers = Column(JSON)  # Храним как JSON для списков
    question_type = Column(String(50), default='multiple_choice')
    points = Column(Integer, default=1)  # Баллы за вопрос
    order_index = Column(Integer, default=0)  # Порядок вопроса в тесте

    # Relationships
    test = relationship("Test", back_populates="questions")
    user_answers = relationship("UserAnswer", back_populates="question", cascade="all, delete-orphan")