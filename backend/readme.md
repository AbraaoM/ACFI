# 📋 TRIBUT.AI - RAG Agent Backend

Sistema de backend para agente RAG (Retrieval-Augmented Generation) usando FastAPI, SQLite, ChromaDB e Gemini.

## 🏗️ Arquitetura do Sistema

### Estrutura de Pastas
```
backend/
├── app/
│   ├── controllers/     # Endpoints da API
│   ├── models/         # Modelos de dados SQLAlchemy
│   ├── services/       # Lógica de negócio
│   └── database.py     # Configuração do banco
├── alembic/            # Migrações de banco
├── data/               # Dados persistidos (SQLite + ChromaDB)
└── uploads/            # Arquivos enviados
```

## 🗄️ Modelos de Dados (SQLite)

### 1. Session
Agrupa conversas relacionadas
- **Campos**: `id`, `name`, `description`, `created_at`, `updated_at`
- **Relacionamento**: 1:N com Chat

### 2. Chat
Mensagens individuais (USER/ASSISTANT/SYSTEM)
- **Campos**: `id`, `session_id`, `role`, `content`, `created_at`
- **Relacionamento**: N:1 com Session

### 3. Document
Metadados dos arquivos processados
- **Campos**: `id`, `filename`, `file_path`, `file_type`, `file_size`, `content`, `status`, `chunks_count`

## 🔧 Serviços Principais

### SessionService
- CRUD completo de sessões
- Validações de negócio

### ChatService
- CRUD de mensagens
- Validação de sessão existente
- Histórico de conversas

### DocumentService
- Upload e processamento de arquivos (PDF, TXT)
- Extração de conteúdo
- Integração com VectorService
- Status tracking (pending → processing → completed/error)

### VectorService
- **Embeddings**: HuggingFace `all-MiniLM-L6-v2` (local, gratuito)
- **Vector Store**: ChromaDB (persistente)
- **Chunking**: RecursiveCharacterTextSplitter (1000 chars, overlap 200)
- **Busca semântica**: Similarity search com scores

## 🌐 API Endpoints

### Sessions (`/api/v1/sessions`)
- `POST /` - Criar sessão
- `GET /` - Listar sessões (paginação)
- `GET /{id}` - Buscar sessão específica
- `PUT /{id}` - Atualizar sessão
- `DELETE /{id}` - Deletar sessão

### Chats (`/api/v1/chats`)
- `POST /` - Criar mensagem
- `GET /session/{session_id}` - Histórico da sessão
- `GET /{id}` - Buscar mensagem específica
- `PUT /{id}` - Atualizar mensagem
- `DELETE /{id}` - Deletar mensagem

### Documents (`/api/v1/documents`)
- `POST /upload` - Upload e processamento
- `GET /search?query={}&k={}` - Busca semântica
- `GET /` - Listar documentos
- `GET /{id}` - Buscar documento específico
- `DELETE /{id}` - Deletar documento

## 🔄 Fluxos Principais

### Fluxo de Upload de Documento
```
Upload → Salvar arquivo → Extrair conteúdo → Chunking → Embeddings → ChromaDB
     ↓
SQLite (metadados) ← Status tracking
```

### Fluxo de Busca Semântica
```
Query → HuggingFace Embeddings → ChromaDB Search → Top K chunks → Retorno
```

### Fluxo RAG (Preparado para Gemini)
```
Query → Busca semântica → Contexto relevante → Gemini Flash → Resposta
                      ↓
                 Salvar no Chat history
```

## 💾 Persistência de Dados

### SQLite (`./data/TRIBUT.AI.sqlite`)
- Metadados estruturados
- Relacionamentos entre entidades
- Histórico de conversas
- Status de processamento

### ChromaDB (`./data/chroma_db/`)
- Embeddings vetoriais
- Chunks de documentos
- Busca por similaridade
- Metadados de contexto

## 🛠️ Tecnologias Utilizadas

- **FastAPI**: Framework web
- **SQLAlchemy**: ORM
- **Alembic**: Migrações
- **ChromaDB**: Vector database
- **LangChain**: Text splitters
- **HuggingFace**: Embeddings locais
- **PyPDF2**: Extração de PDF
- **Gemini**: LLM para geração de respostas

## 🚀 Setup e Instalação

### 1. Clone o repositório
```bash
git clone <repo-url>
cd TRIBUT.AI/backend
```

### 2. Crie e ative o ambiente virtual
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate     # Windows
```

### 3. Instale as dependências
```bash
pip install -r requirements.txt
```

### 4. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite .env e adicione sua GEMINI_KEY
```

### 5. Execute as migrações
```bash
alembic upgrade head
```

### 6. Inicie o servidor
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 📝 Dependências Principais

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.13.1
chromadb
langchain-community
langchain-text-splitters
sentence-transformers
google-generativeai
python-dotenv
PyPDF2
```

## 🎯 Estado Atual

### ✅ Implementado
- CRUD completo (Sessions, Chats, Documents)
- Upload e processamento de documentos
- Busca semântica funcional
- Vector store persistente
- Estrutura de banco com migrações
- Integração com Gemini (configurada)

### ⏳ Próximos passos
- Endpoint RAG completo (busca + geração)
- Interface de chat funcional
- Melhorias na extração de documentos
- Suporte a mais tipos de arquivo

## 📚 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Arquitetura Híbrida Eficiente

O sistema combina:
- **HuggingFace** para embeddings (local, gratuito)
- **ChromaDB** para armazenamento vetorial (local, rápido)
- **SQLite** para metadados (estruturado, confiável)
- **Gemini** para geração de respostas (qualidade, velocidade)

Essa arquitetura garante **eficiência**, **baixo custo** e **alta qualidade** nas respostas RAG! 🚀