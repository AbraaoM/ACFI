from pydantic import BaseModel
from ..enums.document_category_enum import DocumentCategory


class VectorMetadata(BaseModel):
    filename: str
    file_type: str
    category: DocumentCategory
    tags: str