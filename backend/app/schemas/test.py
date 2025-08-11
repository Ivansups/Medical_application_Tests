from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class QuestionCreate(BaseModel):
    question_text: str
    options: Optional[List[str]] = None
    correct_answers: Optional[List[int]] = None  # Здесь хранится индекс правильного ответа из List
    question_type: str = "multiple_choice"

class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    duration: int
    questions: List[QuestionCreate]

class QuestionUpdate(BaseModel):
    id: Optional[UUID] = None  # None для новых вопросов
    question_text: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answers: Optional[List[int]] = None
    question_type: Optional[str] = None

class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    questions: Optional[List[QuestionUpdate]] = None