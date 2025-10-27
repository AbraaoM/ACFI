from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session as DBSession
from typing import Optional

from .controllers import session_controller, chat_controller, document_controller, xml_controller
from .services.rag_service import RAGService
from .services.chat_service import ChatService
from .models.chat_model import MessageRole
from .database import get_db

from dotenv import load_dotenv
import os

load_dotenv()  # Carrega as variáveis de ambiente do arquivo .env

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

# Configuração do CORS para aceitar requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend local
        "http://frontend:3000",   # Frontend no Docker
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "")  # Variável de ambiente para o frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers existentes
app.include_router(session_controller.router, prefix="/api/v1")
app.include_router(chat_controller.router, prefix="/api/v1")
app.include_router(document_controller.router, prefix="/api/v1")
app.include_router(xml_controller.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "ACFI API is running"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            "database": "operational"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)