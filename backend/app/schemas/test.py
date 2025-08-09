from pydantic import BaseModel
from datetime import datetime
from typing import List

class QuestionCreate(BaseModel):
    question_txt: str
    options: List[str]
    answer: List[int] #Здесь хранится индекс правильного ответа их List, который я создал ранее
    question_type: str = "multiple_choice"

class TestCreate(BaseModel):
    test_id: int
    title: str
    description: str = None
    duration: int
    questions: List[QuestionCreate]

class QuestionUpdate(BaseModel):
    id: int = None  # None для новых вопросов
    question_text: str = None
    options: List[str] = None
    correct_answers: List[int] = None
    question_type: str = None

class TestUpdate(BaseModel):
    test_id: int = None
    title: str = None
    description: str = None
    duration: int = None
    questions: List[QuestionUpdate] = None