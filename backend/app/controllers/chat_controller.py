from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as DBSession
from typing import List, Optional

from ..schemas.vector_metadata_schema import VectorMetadata

from ..database import get_db
from ..services.chat_service import ChatService
from ..services.rag_service import RAGService
from ..models.chat_model import MessageRole

router = APIRouter(prefix="/chats", tags=["chats"])
rag_service = RAGService()

# CREATE CHAT - Principal endpoint para chat (sempre com RAG)
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_chat(
    session_id: str,
    question: str,
    k: Optional[int] = 5,
    metadata: VectorMetadata = None,
    db: DBSession = Depends(get_db)
):
    """
    API Route principal para o Chat com Agente
    
    - Recebe pergunta e session_id
    - Retorna resposta do agente junto com trechos citados
    - Salva histórico da conversa
    """
    
    # Salva a pergunta do usuário no histórico
    ChatService.create_chat(db, session_id, MessageRole.USER, question)
    
    # Processa com RAG e citações
    rag_result = rag_service.ask_question_with_citations(question, k, metadata)
    
    # Salva a resposta do assistente no histórico
    ChatService.create_chat(db, session_id, MessageRole.ASSISTANT, rag_result["answer"])
    
    # Retorna resposta completa com trechos citados
    return {
        "question": rag_result["question"],
        "answer": rag_result["answer"],
        "cited_excerpts": rag_result["cited_excerpts"],
        "sources": [
            {
                "citation": f"[{source['number']}]",
                "filename": source["filename"],
                "chunk_section": f"Seção {source['chunk_index'] + 1}",
                "relevance": round(source["relevance_score"], 3)
            }
            for source in rag_result["sources"]
        ],
        "metadata": {
            "session_id": session_id,
            "chunks_analyzed": rag_result["chunks_used"],
            "context_summary": rag_result["context_summary"]
        }
    }

# READ ALL BY SESSION
@router.get("/session/{session_id}", response_model=List[dict])
def get_chats_by_session(
    session_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    db: DBSession = Depends(get_db)
):
    return ChatService.get_chats_by_session(db, session_id, skip, limit)

# READ ONE
@router.get("/{chat_id}", response_model=dict)
def get_chat(chat_id: str, db: DBSession = Depends(get_db)):
    return ChatService.get_chat_by_id(db, chat_id)

# UPDATE
@router.put("/{chat_id}", response_model=dict)
def update_chat(
    chat_id: str,
    content: Optional[str] = None,
    db: DBSession = Depends(get_db)
):
    return ChatService.update_chat(db, chat_id, content)

# DELETE
@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(chat_id: str, db: DBSession = Depends(get_db)):
    return ChatService.delete_chat(db, chat_id)