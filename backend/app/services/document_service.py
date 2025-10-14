from sqlalchemy.orm import Session as DBSession
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status, UploadFile
import PyPDF2
import os
from datetime import datetime

from ..models.document_model import Document
from .vector_service import VectorService

class DocumentService:
    def __init__(self):
        self.vector_service = VectorService()
        self.upload_dir = "./uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
    
    def upload_and_process_document(self, db: DBSession, file: UploadFile) -> Dict:
        """Upload e processa um documento"""
        
        # Salva o arquivo
        file_path = os.path.join(self.upload_dir, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Cria registro no banco
        document = Document(
            filename=file.filename,
            file_path=file_path,
            file_type=file.filename.split('.')[-1].lower(),
            file_size=os.path.getsize(file_path),
            status="processing"
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        try:
            # Extrai o conteúdo
            content = self._extract_content(file_path, document.file_type)
            
            # Atualiza o conteúdo no banco
            document.content = content
            
            # Ingere no vector store
            chunk_ids = self.vector_service.ingest_document(
                document_id=document.id,
                content=content,
                metadata={
                    "filename": document.filename,
                    "file_type": document.file_type
                }
            )
            
            # Atualiza status
            document.status = "completed"
            document.chunks_count = len(chunk_ids)
            document.processed_at = datetime.utcnow()
            
            db.commit()
            
            return {
                "id": document.id,
                "filename": document.filename,
                "status": document.status,
                "chunks_count": document.chunks_count,
                "processed_at": document.processed_at
            }
            
        except Exception as e:
            document.status = "error"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing document: {str(e)}"
            )
    
    def _extract_content(self, file_path: str, file_type: str) -> str:
        """Extrai conteúdo baseado no tipo de arquivo"""
        if file_type == "pdf":
            return self._extract_pdf_content(file_path)
        elif file_type == "txt":
            return self._extract_txt_content(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    def _extract_pdf_content(self, file_path: str) -> str:
        """Extrai texto de PDF"""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    
    def _extract_txt_content(self, file_path: str) -> str:
        """Extrai texto de arquivo TXT"""
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    
    def search_documents(self, query: str, k: int = 5) -> List[Dict]:
        """Busca documentos por similaridade"""
        return self.vector_service.similarity_search(query, k)
    
    def delete_document(self, db: DBSession, document_id: str):
        """Deleta documento do banco e do vector store"""
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Remove do vector store
        self.vector_service.delete_document(document_id)
        
        # Remove arquivo físico
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Remove do banco
        db.delete(document)
        db.commit()
    
    def get_documents(self, db: DBSession, skip: int = 0, limit: int = 100) -> List[Dict]:
        """Lista documentos"""
        documents = db.query(Document).offset(skip).limit(limit).all()
        
        return [
            {
                "id": doc.id,
                "filename": doc.filename,
                "file_type": doc.file_type,
                "file_size": doc.file_size,
                "status": doc.status,
                "chunks_count": doc.chunks_count,
                "created_at": doc.created_at,
                "processed_at": doc.processed_at
            }
            for doc in documents
        ]