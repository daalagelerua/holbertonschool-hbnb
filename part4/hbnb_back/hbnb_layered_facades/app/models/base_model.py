from abc import ABC, abstractmethod
import uuid
from datetime import datetime, timezone
from app import db

class BaseModel(ABC):
    @abstractmethod
    def __init__(self):
        pass
    
    @abstractmethod
    def update(self, data=None):
        pass
    
class BaseEntity(BaseModel):
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def update(self, data=None):
        self.updated_at = datetime.now()
        return self
    
class SQLBaseModel(db.Model):
    __abstract__ = True  # This ensures SQLAlchemy does not create a table for BaseModel

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime,
                            default=lambda: datetime.now(timezone.utc),
                            onupdate=lambda: datetime.now(timezone.utc))
