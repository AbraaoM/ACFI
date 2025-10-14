from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as DBSession
from typing import List, Optional

from ..database import get_db
from ..services.chat_service import ChatService
from ..services.rag_service import RAGService
from ..models.chat_model import MessageRole

router = APIRouter(prefix="/chats", tags=["chats"])
rag_service = RAGService()

# CREATE
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_chat(
    session_id: str, 
    role: MessageRole, 
    content: str, 
    db: DBSession = Depends(get_db)
):
    return ChatService.create_chat(db, session_id, role, content)

# RAG QUERY - Endpoint principal para chat com RAG
@router.post("/rag", response_model=dict)
def ask_rag_question(
    session_id: str,
    question: str,
    k: Optional[int] = 5,
    db: DBSession = Depends(get_db)
):
    """Faz uma pergunta usando RAG com citações completas"""
    
    # Salva a pergunta do usuário
    ChatService.create_chat(db, session_id, MessageRole.USER, question)
    
    # Processa com RAG e citações
    rag_result = rag_service.ask_question_with_citations(question, k)
    
    # Salva a resposta do assistente
    ChatService.create_chat(db, session_id, MessageRole.ASSISTANT, rag_result["answer"])
    
    return rag_result

# CHAT SIMPLES - Sem RAG
@router.post("/simple", response_model=dict)
def simple_chat(
    session_id: str,
    message: str,
    db: DBSession = Depends(get_db)
):
    """Chat simples sem busca em documentos"""
    
    # Salva a pergunta do usuário
    ChatService.create_chat(db, session_id, MessageRole.USER, message)
    
    # Resposta simples
    answer = rag_service.simple_chat(message)
    
    # Salva a resposta do assistente
    ChatService.create_chat(db, session_id, MessageRole.ASSISTANT, answer)
    
    return {
        "question": message,
        "answer": answer,
        "session_id": session_id,
        "type": "simple_chat"
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