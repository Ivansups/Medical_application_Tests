from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class TestAttemptCreate(BaseModel):
    test_id: UUID

class TestAttemptResponse(BaseModel):
    id: UUID
    test_id: UUID
    user_id: UUID
    started_at: datetime
    completed_at: Optional[datetime]
    score: Optional[int]
    max_score: Optional[int]
    status: str
    
    class Config:
        from_attributes = True

class UserAnswerCreate(BaseModel):
    question_id: UUID
    selected_options: Optional[List[int]] = None
    text_answer: Optional[str] = None

class UserAnswerResponse(BaseModel):
    id: UUID
    attempt_id: UUID
    question_id: UUID
    selected_options: Optional[List[int]] = None
    text_answer: Optional[str] = None
    is_correct: Optional[bool] = None
    points_earned: int
    answered_at: datetime
    
    class Config:
        from_attributes = True

class TestResult(BaseModel):
    attempt_id: UUID
    score: int
    max_score: int
    percentage: float
    correct_answers: int
    total_questions: int
    time_taken: Optional[int] = None  # в секундах