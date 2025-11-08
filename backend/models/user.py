from sqlalchemy import Column, Integer, String, Float, Text, Enum
from .base import Base
import enum


class UserRole(str, enum.Enum):
    admin ="admin"
    customer ="customer"
    author ="author"
    
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
