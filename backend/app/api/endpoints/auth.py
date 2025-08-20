from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.exceptions import UnauthorizedException, ValidationException
from app.schemas.auth import LoginData, Token, UserCreate, UserResponse
from app.core.auth import ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token, create_user, get_current_active_user
from ...db.session import get_db
from ...db.models.user import User

router = APIRouter()

def _authenticate_user(db: Session, email: str, password: str) -> Token:
    """Внутренняя функция для аутентификации пользователя"""
    user = authenticate_user(db, email, password)
    if not user:
        raise UnauthorizedException("Неверные учетные данные")
    
    if not user.is_active:
        raise UnauthorizedException("Пользователь деактивирован")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    try:
        user_obj = create_user(db, email=user.email, password=user.password)
        return user_obj
    except ValidationException as e:
        raise e
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при регистрации пользователя"
        )

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Получение токена доступа через OAuth2PasswordRequestForm"""
    return _authenticate_user(db, form_data.username, form_data.password)

@router.post("/login", response_model=Token)
def login(user: LoginData, db: Session = Depends(get_db)):
    """Альтернативный эндпоинт для входа через JSON"""
    return _authenticate_user(db, user.email, user.password)

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Получение информации о текущем пользователе"""
    return current_user