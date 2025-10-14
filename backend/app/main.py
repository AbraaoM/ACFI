from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session as DBSession
from typing import Optional

from .controllers import session_controller, chat_controller, document_controller
from .services.rag_service import RAGService
from .services.chat_service import ChatService
from .models.chat_model import MessageRole
from .database import get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

# Configuração do CORS para aceitar requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers existentes
app.include_router(session_controller.router, prefix="/api/v1")
app.include_router(chat_controller.router, prefix="/api/v1")
app.include_router(document_controller.router, prefix="/api/v1")

# Instância global do RAGService
rag_service = RAGService()

# NOVA ROTA PRINCIPAL /api/chat (ACFI-1.6)
@app.post("/api/chat", response_model=dict, tags=["chat-rag"])
def chat_with_agent(
    question: str,
    session_id: str,
    k: Optional[int] = 5,
    db: DBSession = Depends(get_db)
):
    """
    API Route principal para o Agente RAG
    
    Especificação ACFI-1.6:
    - Recebe pergunta e session_id
    - Retorna resposta do agente junto com trechos citados
    - Salva histórico da conversa
    """
    
    # Salva a pergunta do usuário no histórico
    ChatService.create_chat(db, session_id, MessageRole.USER, question)
    
    # Processa com RAG e citações
    rag_result = rag_service.ask_question_with_citations(question, k)
    
    # Salva a resposta do assistente no histórico
    ChatService.create_chat(db, session_id, MessageRole.ASSISTANT, rag_result["answer"])
    
    # Retorna resposta completa com trechos citados
    return {
        "question": rag_result["question"],
        "answer": rag_result["answer"],
        "cited_excerpts": rag_result["cited_excerpts"],  # Trechos citados
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

@app.get("/")
def read_root():
    return {"message": "ACFI API is running"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "rag": "operational",
            "vector_store": "operational",
            "llm": "operational"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)