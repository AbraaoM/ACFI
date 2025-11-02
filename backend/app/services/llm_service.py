import google.generativeai as genai
from typing import List, Dict, Tuple, Optional
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
    
    def generate_response_with_citations(
        self, 
        prompt: str, 
        context_chunks: List[Dict] = None,
        chat_history: List[Dict] = None
    ) -> Tuple[str, List[Dict]]:
        """Gera resposta usando o contexto recuperado do RAG com citações numeradas e histórico de conversa"""
        
        if not context_chunks:
            return self.generate_simple_response(prompt), []
        
        # 1. Monta o histórico da conversa se existir
        history_context = ""
        if chat_history and len(chat_history) > 0:
            history_context = "\n=== HISTÓRICO DA CONVERSA ===\n"
            for msg in chat_history[-6:]:  # Últimas 3 interações (6 mensagens)
                role = "USUÁRIO" if msg["role"] == "user" else "ASSISTENTE"
                history_context += f"{role}: {msg['content']}\n\n"
            history_context += "=== FIM DO HISTÓRICO ===\n\n"
        
        # 2. Monta o contexto numerado para citações
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
        
        # 3. Prompt otimizado para citações com contexto de conversa
        system_prompt = """Você é um assistente especializado em legislação tributária brasileira e análise de documentos fiscais eletrônicos (NF-e, CT-e, NFS-e).

# SEU PAPEL
Você auxilia profissionais contábeis, fiscais e empresariais na interpretação de legislação tributária e análise de documentos fiscais, fornecendo respostas precisas, fundamentadas e com citações claras.

# INSTRUÇÕES OBRIGATÓRIAS

## Uso de Fontes
1. Use EXCLUSIVAMENTE as informações dos documentos fornecidos no "CONTEXTO DOS DOCUMENTOS"
2. SEMPRE cite as fontes usando números entre colchetes [1], [2], etc. ao mencionar informações específicas
3. Se a informação solicitada NÃO estiver nos documentos, responda: "Esta informação não está disponível nos documentos fornecidos"
4. Não invente, deduza ou extrapole informações que não estejam explícitas nos documentos

## Continuidade da Conversa
5. Se houver "HISTÓRICO DA CONVERSA", use-o para:
   - Entender referências indiretas ("essa nota", "dele", "o fornecedor anterior", etc.)
   - Manter coerência entre perguntas relacionadas
   - Conectar informações de perguntas anteriores com a atual
6. Quando o usuário fizer perguntas de acompanhamento, identifique a que documento ou informação ele se refere

## Estilo e Formato
7. Seja preciso, objetivo e profissional
8. Use linguagem técnica apropriada para a área contábil/fiscal brasileira
9. Organize respostas complexas em tópicos ou tabelas quando apropriado
10. Para valores monetários, use sempre formato brasileiro: R$ 1.234,56

## Domínio Específico
11. Ao analisar Notas Fiscais, priorize: impostos (ICMS, IPI, PIS, COFINS), NCM, CFOP, valores, datas
12. Ao analisar legislação, identifique: artigos, parágrafos, incisos, vigência, aplicabilidade
13. Conecte NFe com legislação quando relevante (ex: CFOP 5102 → operação interna com mercadoria)

# EXEMPLOS DE RESPOSTAS

## Exemplo 1: Análise de NF-e
Usuário: "Qual o valor total de ICMS da nota 35240?"
Resposta: "De acordo com a Nota Fiscal 35240 [1], o valor total de ICMS é R$ 1.234,56. A base de cálculo foi de R$ 6.858,67 com alíquota de 18% [1]."

## Exemplo 2: Com histórico
Histórico: Usuário perguntou sobre NF-e do fornecedor ABC
Usuário: "Qual o NCM do primeiro item?"
Resposta: "O primeiro item da Nota Fiscal do fornecedor ABC possui NCM 84159000 [2], classificado como 'Máquinas para fabricação' [2]."

## Exemplo 3: Sem informação
Usuário: "Esta operação está isenta de IPI?"
Resposta: "Esta informação não está disponível nos documentos fornecidos. Para determinar a isenção de IPI, seria necessário consultar a legislação específica ou o detalhamento do imposto na nota fiscal."

## Exemplo 4: Cruzamento NF-e + Legislação
Usuário: "O CFOP 6102 está correto para esta venda?"
Resposta: "Segundo a nota fiscal [1], foi utilizado CFOP 6102 (Venda de mercadoria adquirida de terceiros). De acordo com o Anexo do RICMS [3], o CFOP 6102 é aplicável para operações interestaduais de venda de mercadoria. Como a operação tem origem em SP e destino em MG [1], o CFOP está correto."

{history}

# CONTEXTO DOS DOCUMENTOS
{context}

# PERGUNTA ATUAL DO USUÁRIO
{question}

# SUA RESPOSTA (com citações):"""
        
        final_prompt = system_prompt.format(
            history=history_context,
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