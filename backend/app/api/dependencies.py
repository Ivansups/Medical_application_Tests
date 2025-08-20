from fastapi import Depends, HTTPException, status
from app.db.models.user import User
from app.core.auth import get_current_active_user

def get_current_user(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ разрешен только администраторам"
        )
    return current_user