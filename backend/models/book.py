from sqlalchemy import Column, Integer, String, Float, Text
from .base import Base

class Book(Base):
    __tablename__ = 'books'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    isbn = Column(String(13), unique=True, nullable=False)
    cover_image = Column(String(255), nullable=True)