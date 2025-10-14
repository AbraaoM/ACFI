import google.generativeai as genai
from typing import List, Dict, Any, Tuple
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

class LLMService:
    def __init__(self):
        # Configura o Gemini
        api_key = os.getenv("GEMINI_KEY")
        if not api_key:
            raise ValueError("GEMINI_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        
        # Usa o modelo Gemini 2.0 Flash Exp
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Configurações do modelo
        self.generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
    
    def generate_response_with_citations(self, prompt: str, context_chunks: List[Dict] = None) -> Tuple[str, List[Dict]]:
        """Gera resposta usando o contexto recuperado do RAG com citações numeradas"""
        
        if not context_chunks:
            return self.generate_simple_response(prompt), []
        
        # Monta o contexto numerado para citações
        context_with_numbers = ""
        sources = []
        
        for i, chunk in enumerate(context_chunks, 1):
            filename = chunk.get('metadata', {}).get('filename', 'Documento desconhecido')
            chunk_index = chunk.get('metadata', {}).get('chunk_index', 0)
            
            context_with_numbers += f"\n[{i}] Fonte: {filename} (Seção {chunk_index + 1})\n"
            context_with_numbers += f"Conteúdo: {chunk['content']}\n"
            
            # Adiciona à lista de fontes para retorno
            sources.append({
                "number": i,
                "filename": filename,
                "chunk_index": chunk_index,
                "content_preview": chunk['content'][:200] + "..." if len(chunk['content']) > 200 else chunk['content'],
                "relevance_score": chunk.get('score', 0)
            })
        
        # Prompt otimizado para citações
        system_prompt = """Você é um assistente jurídico especializado em responder perguntas baseado em documentos fornecidos.

INSTRUÇÕES IMPORTANTES:
1. Use APENAS as informações dos documentos fornecidos no contexto
2. SEMPRE cite as fontes usando os números entre colchetes [1], [2], etc. quando mencionar informações
3. Se a informação não estiver nos documentos, diga claramente "Esta informação não está disponível nos documentos fornecidos"
4. Seja preciso, objetivo e mantenha tom profissional
5. Responda em português brasileiro
6. Para cada informação importante, inclua a citação correspondente

EXEMPLO DE CITAÇÃO:
"De acordo com o documento, a Emenda Constitucional 132/2023 estabelece novas regras [1]. O prazo para implementação é de 180 dias [2]."

CONTEXTO DOS DOCUMENTOS:
{context}

PERGUNTA DO USUÁRIO:
{question}

RESPOSTA COM CITAÇÕES:"""
        
        final_prompt = system_prompt.format(
            context=context_with_numbers,
            question=prompt
        )
        
        try:
            response = self.model.generate_content(
                final_prompt,
                generation_config=self.generation_config
            )
            return response.text, sources
        except Exception as e:
            return f"Erro ao gerar resposta: {str(e)}", sources
    
    def generate_simple_response(self, prompt: str) -> str:
        """Gera resposta simples sem contexto RAG"""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            return response.text
        except Exception as e:
            return f"Erro ao gerar resposta: {str(e)}"