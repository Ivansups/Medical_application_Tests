from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base

class Question(Base):
    __tablename__ = 'questions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID, ForeignKey('tests.id'), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSONB)
    correct_answers = Column(JSONB) 
    question_type = Column(String(50), default='multiple_choice')