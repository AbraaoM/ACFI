from pydantic import BaseModel
from ..enums.document_category_enum import DocumentCategory


class VectorMetadata(BaseModel):
    filename: str = None
    file_type: str = None
    category: DocumentCategory = None
    tags: str = None