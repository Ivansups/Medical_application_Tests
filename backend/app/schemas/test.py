from pydantic import BaseModel
from datetime import datetime
from typing import List
from uuid import UUID as PyUUID

class TestBase(BaseModel):
    title: str
    description: str = None

class TestCreate(TestBase):
    pass

class Test(TestBase):
    id: PyUUID
    created_at: datetime
    duration_minutes: int
    
    class Config:
        from_attributes = True