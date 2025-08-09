from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid
from .base import Base
from sqlalchemy.orm import relationship


class Question(Base):
    __tablename__ = 'questions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey('tests.id'), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON)  # Храним как JSON для списков
    correct_answers = Column(JSON)  # Храним как JSON для списков
    question_type = Column(String(50), default='multiple_choice')

    test = relationship("Test", back_populates="questions")