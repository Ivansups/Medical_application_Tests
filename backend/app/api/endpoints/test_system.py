from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging
from uuid import UUID
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.schemas.test_attempt import TestAttemptResponse, UserAnswerResponse
from app.crud.crud import create_test_attempt, get_user_attempts
from app.db.models.test_attempts import TestAttempt
from app.db.models.questions import Question
from app.db.models.user_answers import UserAnswer
from app.schemas.test_attempt import UserAnswerCreate
from app.db.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/tests/{test_id}/start", response_model=TestAttemptResponse, description="Начать прохождение теста")
async def start_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Начать прохождение теста"""
    return create_test_attempt(db, test_id, current_user.id)

@router.post("/attempts/{attempt_id}/submit-answer", response_model=UserAnswerResponse, description="Отправить ответ на вопрос")
async def submit_answer(
    attempt_id: UUID,
    question_id: UUID,
    answer_data: UserAnswerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == attempt_id,
        TestAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Attempt not found or not yours"
        )
    
    if attempt.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Attempt already completed"
        )
    if attempt.status == "abandoned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Attempt already abandoned"
        )

    question = db.query(Question).filter(
        Question.id == question_id,
        Question.test_id == attempt.test_id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Question not found or not related to this test"
        )

    existing_answer = db.query(UserAnswer).filter(
        UserAnswer.attempt_id == attempt_id,
        UserAnswer.question_id == question_id
    ).first()
    
    if existing_answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="You already answered this question"
        )

    is_correct = False
    points_earned = 0
    
    if question.question_type == "multiple_choice":
        selected = set(answer_data.selected_options or [])
        correct = set(question.correct_answers)
        is_correct = selected == correct
        points_earned = question.points if is_correct else 0
    elif question.question_type == "text":
        user_text = (answer_data.text_answer or "").strip().lower()
        correct_text = question.correct_answers.strip().lower()
        is_correct = user_text == correct_text
        points_earned = question.points if is_correct else 0

    user_answer = UserAnswer(
        attempt_id=attempt_id,
        question_id=question_id,
        selected_options=answer_data.selected_options,
        text_answer=answer_data.text_answer,
        is_correct=is_correct,
        points_earned=points_earned
    )
    
    db.add(user_answer)
    db.commit()
    db.refresh(user_answer)
    
    return user_answer
    
    