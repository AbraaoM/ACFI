from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session as DBSession
from typing import List, Optional

from ..database import get_db
from ..services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])
document_service = DocumentService()

# UPLOAD AND PROCESS DOCUMENT
@router.post("/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    db: DBSession = Depends(get_db)
):
    """Upload e processa um documento"""
    return document_service.upload_and_process_document(db, file)

# SEARCH DOCUMENTS BY SIMILARITY
@router.get("/search", response_model=List[dict])
def search_documents(
    query: str = Query(..., description="Query para busca por similaridade"),
    k: int = Query(5, description="Número de resultados")
):
    """Busca documentos por similaridade usando embeddings"""
    return document_service.search_documents(query, k)

# READ ALL DOCUMENTS
@router.get("/", response_model=List[dict])
def get_documents(
    skip: int = 0, 
    limit: int = 100, 
    db: DBSession = Depends(get_db)
):
    """Lista todos os documentos"""
    return document_service.get_documents(db, skip, limit)

# READ ONE DOCUMENT
@router.get("/{document_id}", response_model=dict)
def get_document(document_id: str, db: DBSession = Depends(get_db)):
    """Busca um documento específico"""
    documents = document_service.get_documents(db)
    document = next((doc for doc in documents if doc["id"] == document_id), None)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document

# DELETE DOCUMENT
@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: DBSession = Depends(get_db)):
    """Deleta um documento do banco e do vector store"""
    return document_service.delete_document(db, document_id)