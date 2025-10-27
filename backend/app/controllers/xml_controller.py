from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session as DBSession
from typing import Dict, Any

from ..database import get_db
from ..services.xml_service import XMLService
from ..services.rag_service import RAGService

router = APIRouter(prefix="/xml", tags=["xml"])
xml_service = XMLService()
rag_service = RAGService()

@router.post("/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
def upload_xml(
    file: UploadFile = File(...),
    db: DBSession = Depends(get_db)
):
    """Upload e processa um arquivo XML com análise tributária em tempo real"""
    
    # Validar se o arquivo é XML
    if not file.filename.lower().endswith('.xml'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo deve ter extensão .xml"
        )
    
    # Validar content type
    if file.content_type not in ["application/xml", "text/xml"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de arquivo deve ser XML"
        )
    
    # Processa o XML em tempo real
    return xml_service.upload_and_process_xml(db, file)

@router.post("/analyze", response_model=dict)
def analyze_xml_with_knowledge_base(
    file: UploadFile = File(...),
    question: str = Query(..., description="Pergunta combinando XML e base de conhecimento"),
    db: DBSession = Depends(get_db)
):
    """Analisa XML e combina com conhecimento da base para resposta completa"""
    
    # Validações
    if not file.filename.lower().endswith('.xml'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo deve ter extensão .xml"
        )
    
    try:
        # Processa o XML
        xml_result = xml_service.upload_and_process_xml(db, file)
        
        if not xml_result.get("tax_analysis"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível gerar análise tributária para este XML"
            )
        
        # Combina com base de conhecimento
        return rag_service.ask_with_xml_context(
            question=question,
            xml_analysis=xml_result["tax_analysis"],
            xml_filename=xml_result["filename"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar análise combinada: {str(e)}"
        )

@router.get("/ask-knowledge", response_model=dict)
def ask_knowledge_base(
    question: str = Query(..., description="Pergunta para a base de conhecimento"),
    k: int = Query(5, description="Número de chunks para análise")
):
    """Consulta apenas a base de conhecimento permanente"""
    return rag_service.ask_question_with_citations(question, k)