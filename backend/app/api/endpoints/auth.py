from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.exceptions import UnauthorizedException, ValidationException
from app.schemas.auth import LoginData, Token, UserCreate, UserResponse
from app.core.auth import authenticate_user, create_access_token, create_user, get_current_active_user
from app.core.config import settings
from ...db.session import get_db
from ...db.models.user import User
from fastapi import Form


router = APIRouter()

def _authenticate_user(db: Session, email: str, password: str) -> Token:
    user = authenticate_user(db, email, password)
    if not user:
        raise UnauthorizedException("Неверные учетные данные")
    
    if not user.is_active:
        raise UnauthorizedException("Пользователь деактивирован")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        user_obj = create_user(db, email=user.email, password=user.password, name=user.name)
        
        return UserResponse(
            id=str(user_obj.id),
            email=user_obj.email,
            name=user_obj.name,
            is_active=user_obj.is_active,
            is_admin=user_obj.is_admin,
            created_at=user_obj.created_at
        )
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
    return _authenticate_user(db, form_data.username, form_data.password)

@router.post("/login", response_model=Token)
def login(user: LoginData, db: Session = Depends(get_db)):
    return _authenticate_user(db, user.email, user.password)

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        is_active=current_user.is_active,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at
    )

@router.post("/token/json", response_model=Token)
def login_for_access_token_json(
    login_data: LoginData,
    db: Session = Depends(get_db)
):
    return _authenticate_user(db, login_data.email, login_data.password)