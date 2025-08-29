from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class QuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=1, max_length=1000, description="Question text")
    options: Optional[List[str]] = Field(None, description="List of answer options")
    correct_answers: Optional[List[int]] = Field(None, description="Indices of correct answers")
    question_type: str = Field("multiple_choice", description="Type of question")
    
    @validator('question_type')
    def validate_question_type(cls, v):
        allowed_types = ['multiple_choice', 'single_choice', 'open_ended']
        if v not in allowed_types:
            raise ValueError(f'question_type must be one of {allowed_types}')
        return v

class TestCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Test title")
    description: Optional[str] = Field(None, max_length=500, description="Test description")
    duration: int = Field(..., gt=0, le=480, description="Test duration in minutes (1-480)")
    is_active: bool = Field(True, description="Test active status")
    questions: List[QuestionCreate] = Field(..., min_items=1, max_items=100, description="List of questions")
    
    @validator('questions')
    def validate_questions(cls, v):
        if not v:
            raise ValueError('Test must have at least one question')
        return v

class TestResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    duration: int
    is_active: bool
    created_at: datetime
    questions: List[QuestionCreate]
    
    class Config:
        from_attributes = True

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