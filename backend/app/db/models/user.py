from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(String(20), default='student')  # student, admin
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    test_attempts = relationship("TestAttempt", back_populates="user", cascade="all, delete-orphan")