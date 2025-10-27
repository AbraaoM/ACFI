from typing import Dict, Any, List, Tuple
from .vector_service import VectorService
from .llm_service import LLMService

class RAGService:
    def __init__(self):
        self.vector_service = VectorService()
        self.llm_service = LLMService()
    
    def ask_question_with_citations(self, question: str, k: int = 5) -> Dict[str, Any]:
        """Processa uma pergunta usando RAG com base de conhecimento permanente"""
        
        # 1. Busca documentos relevantes na base de conhecimento
        rag_result = self.vector_service.rag_query(question, k)
        context_chunks = rag_result["context_chunks"]
        
        if not context_chunks:
            return {
                "question": question,
                "answer": "Não encontrei informações relevantes na base de conhecimento para responder sua pergunta. Para análise de NFes específicas, use o endpoint de upload de XML.",
                "sources": [],
                "chunks_used": 0,
                "cited_excerpts": []
            }
        
        # 2. Gera resposta com citações usando o contexto da base de conhecimento
        answer, sources = self.llm_service.generate_response_with_citations(question, context_chunks)
        
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
            "context_summary": f"Consultados {len(context_chunks)} trechos de {len(set(chunk['metadata'].get('filename', 'Unknown') for chunk in context_chunks))} documentos da base de conhecimento"
        }
    
    def ask_with_xml_context(self, question: str, xml_analysis: Dict[str, Any], 
                           xml_filename: str, k: int = 3) -> Dict[str, Any]:
        """Responde pergunta combinando análise de XML específico com base de conhecimento"""
        
        # 1. Busca contexto relevante na base de conhecimento
        rag_result = self.vector_service.rag_query(question, k)
        knowledge_base_context = rag_result["context_chunks"]
        
        # 2. Combina contexto da base com análise do XML
        combined_context = self._combine_xml_and_knowledge_context(
            xml_analysis, xml_filename, knowledge_base_context
        )
        
        # 3. Gera resposta especializada
        answer = self._generate_combined_response(question, combined_context, xml_analysis)
        
        return {
            "question": question,
            "answer": answer,
            "xml_source": xml_filename,
            "knowledge_base_chunks": len(knowledge_base_context),
            "analysis_type": "combined_xml_knowledge"
        }
    
    def _combine_xml_and_knowledge_context(self, xml_analysis: Dict[str, Any], 
                                         xml_filename: str, kb_chunks: List[Dict]) -> str:
        """Combina análise do XML com contexto da base de conhecimento"""
        
        context = f"""
ANÁLISE DO XML ATUAL ({xml_filename}):

RESUMO TRIBUTÁRIO:
- Valor dos produtos: R$ {xml_analysis.get('resumo_atual', {}).get('valor_produtos', 0):,.2f}
- Total de impostos: R$ {xml_analysis.get('resumo_atual', {}).get('impostos', {}).get('total', 0):,.2f}
- Carga tributária: {xml_analysis.get('resumo_atual', {}).get('carga_tributaria_percentual', 0):.2f}%

PROJEÇÃO IVA:
- IVA estimado: R$ {xml_analysis.get('projecao_iva', {}).get('valor_iva_total', 0):,.2f}
- Diferença vs atual: {xml_analysis.get('comparativo', {}).get('diferenca', {}).get('percentual', 0):+.1f}%

CONTEXTO DA BASE DE CONHECIMENTO:
"""
        
        for i, chunk in enumerate(kb_chunks, 1):
            filename = chunk.get('metadata', {}).get('filename', 'Documento')
            context += f"\n[{i}] {filename}: {chunk['content'][:300]}...\n"
        
        return context
    
    def _generate_combined_response(self, question: str, context: str, xml_analysis: Dict[str, Any]) -> str:
        """Gera resposta combinando análise XML com conhecimento geral"""
        
        prompt = f"""
Você é um especialista em análise tributária brasileira. Responda a pergunta considerando:

1. A análise específica do XML fornecido
2. O contexto geral da base de conhecimento sobre tributação
3. As regras da reforma tributária e IVA

CONTEXTO:
{context}

PERGUNTA: {question}

RESPOSTA (seja específico sobre o XML analisado e contextualize com o conhecimento geral):
"""
        
        try:
            response = self.llm_service.model.generate_content(
                prompt,
                generation_config=self.llm_service.generation_config
            )
            return response.text
        except Exception as e:
            return f"Erro ao gerar resposta combinada: {str(e)}"
    
    def simple_chat(self, message: str) -> str:
        """Chat simples sem RAG"""
        return self.llm_service.generate_simple_response(message)