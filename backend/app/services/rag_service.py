from typing import Dict, Any, List, Tuple, Optional

from ..schemas.vector_metadata_schema import VectorMetadata
from .vector_service import VectorService
from .llm_service import LLMService

class RAGService:
    def __init__(self):
        self.vector_service = VectorService()
        self.llm_service = LLMService()

    def ask_question_with_citations(
        self, 
        question: str, 
        k: int = 5, 
        metadata: VectorMetadata = None,
        chat_history: List[Dict] = None
    ) -> Dict[str, Any]:
        """Processa uma pergunta usando RAG completo com citações e histórico de conversa"""
        
        # 1. Busca documentos relevantes
        rag_result = self.vector_service.rag_query(question, k, metadata)
        context_chunks = rag_result["context_chunks"]
        
        if not context_chunks:
            return {
                "question": question,
                "answer": "Não encontrei informações relevantes nos documentos disponíveis para responder sua pergunta.",
                "sources": [],
                "chunks_used": 0,
                "cited_excerpts": [],
                "context_summary": "Nenhum documento relevante encontrado"
            }
        
        # 2. Gera resposta com citações usando o contexto E o histórico da conversa
        answer, sources = self.llm_service.generate_response_with_citations(
            question, 
            context_chunks,
            chat_history=chat_history
        )
        
        # 3. Prepara trechos citados para exibição
        cited_excerpts = [
            {
                "citation_number": source["number"],
                "filename": source["filename"],
                "excerpt": source["content_preview"],
                "relevance_score": source["relevance_score"]
            }
            for source in sources
        ]
        
        # 4. Retorna resultado completo
        return {
            "question": question,
            "answer": answer,
            "sources": sources,
            "chunks_used": len(context_chunks),
            "cited_excerpts": cited_excerpts,
            "context_summary": f"Consultados {len(context_chunks)} trechos de {len(set(chunk['metadata'].get('filename', 'Unknown') for chunk in context_chunks))} documentos"
        }
    
    def simple_chat(self, message: str) -> str:
        """Chat simples sem RAG"""
        return self.llm_service.generate_simple_response(message)