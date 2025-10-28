from sqlalchemy import Column, Enum, String, DateTime, Text, Integer
from sqlalchemy.sql import func
import uuid

from .session_model import Base
from ..enums.document_category_enum import DocumentCategory
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, txt, docx
    file_size = Column(Integer, nullable=False)
    content = Column(Text, nullable=True)  # texto extraído
    status = Column(String(50), default="pending")  # pending, processing, completed, error
    category = Column(Enum(DocumentCategory), nullable=False, default=DocumentCategory.LEGISLACAO)
    chunks_count = Column(Integer, default=0)  # número de chunks gerados
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Document(id='{self.id}', filename='{self.filename}', status='{self.status}')>"