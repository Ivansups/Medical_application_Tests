from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from .base import Base
from sqlalchemy.orm import relationship

class Test(Base):
    __tablename__ = 'tests'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    duration = Column(Integer, nullable=False)

    questions = relationship(
        "Question",
        back_populates="test",
        cascade="all, delete-orphan"
    )
