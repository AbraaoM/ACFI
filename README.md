# ACFI - Assistente de Conformidade Fiscal Inteligente

Sistema RAG (Retrieval-Augmented Generation) especializado em legislação tributária brasileira e análise de documentos fiscais eletrônicos (NF-e), desenvolvido com FastAPI e Next.js.

## 🎯 Funcionalidades

- **Chat Inteligente com RAG**: Consulte legislação tributária e documentos fiscais com respostas fundamentadas e citações
- **Processamento de NF-e**: Upload e análise automática de Notas Fiscais Eletrônicas (XML)
- **Gestão de Documentos**: Upload de PDFs, TXTs e XMLs com categorização
- **Dashboard Analítico**: Estatísticas e visualizações de documentos fiscais processados
- **Busca Semântica**: Encontre informações relevantes usando embeddings vetoriais
- **Histórico de Conversas**: Sessões organizadas com contexto preservado

## 🐳 Executando com Docker

### Pré-requisitos
- Docker
- Docker Compose

### Configuração Rápida

1. **Clone o repositório:**
```bash
git clone https://github.com/AbraaoM/ACFI.git
cd ACFI
```

2. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto:
```env
# Google Gemini API
GEMINI_KEY=sua_chave_api_gemini_aqui

# Database
DATABASE_URL=sqlite:///./app.db

# Backend
API_BASE_URL=http://localhost:8000
```

3. **Execute os containers:**
```bash
docker-compose up --build
```

### Serviços Disponíveis

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentação Interativa:** http://localhost:8000/docs
- **Documentação ReDoc:** http://localhost:8000/redoc

### Comandos Úteis

**Parar os containers:**
```bash
docker-compose down
```

**Limpar dados e volumes:**
```bash
docker-compose down -v
```

**Ver logs em tempo real:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Acessar shell do container:**
```bash
docker-compose exec backend bash
```

**Executar migrações do banco:**
```bash
docker-compose exec backend alembic upgrade head
```

**Criar nova migração:**
```bash
docker-compose exec backend alembic revision --autogenerate -m "descrição"
```

## 🛠️ Desenvolvimento Local

### Backend (Python 3.11+)

1. **Crie um ambiente virtual:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

4. **Execute as migrações:**
```bash
alembic upgrade head
```

5. **Inicie o servidor de desenvolvimento:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Node.js 18+)

1. **Instale as dependências:**
```bash
cd frontend
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
# Edite conforme necessário
```

3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
ACFI/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── controllers/       # Endpoints REST
│   │   ├── models/            # Modelos SQLAlchemy
│   │   ├── services/          # Lógica de negócio
│   │   ├── schemas/           # Schemas Pydantic
│   │   ├── enums/             # Enumerações
│   │   ├── database.py        # Configuração do banco
│   │   └── main.py            # App principal
│   ├── alembic/               # Migrações de banco
│   ├── data/                  # Dados persistidos
│   │   └── chroma_db/         # Vector store ChromaDB
│   ├── uploads/               # Arquivos enviados
│   ├── requirements.txt       # Dependências Python
│   └── Dockerfile
├── frontend/                  # Interface Next.js
│   ├── src/
│   │   ├── app/              # Pages e rotas (App Router)
│   │   ├── components/       # Componentes React
│   │   ├── services/         # Chamadas API
│   │   ├── models/           # TypeScript types
│   │   └── enums/            # Enumerações
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml        # Orquestração
├── LICENSE                   # Licença MIT
└── README.md                # Este arquivo
```

## 🔧 Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e performático
- **SQLAlchemy** - ORM para PostgreSQL/SQLite
- **Alembic** - Controle de migrações de banco
- **ChromaDB** - Vector database para embeddings
- **LangChain** - Framework para aplicações LLM
- **HuggingFace Transformers** - Modelos de embeddings
- **Google Gemini 2.0 Flash** - Modelo de linguagem
- **PyPDF2** - Processamento de PDFs
- **xmltodict** - Parsing de XML (NF-e)
- **Pydantic** - Validação de dados

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **DaisyUI** - Componentes prontos para Tailwind

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **SQLite** - Banco de dados (desenvolvimento)
- **PostgreSQL** - Banco de dados (produção - recomendado)

## 📊 Funcionalidades Técnicas

### RAG (Retrieval-Augmented Generation)
- Embeddings: `sentence-transformers/all-MiniLM-L6-v2`
- Chunking: Recursive Character Text Splitter (1000 chars, 200 overlap)
- Vector Store: ChromaDB com persistência local
- Filtros de metadata: categoria, tipo de arquivo, tags

### Processamento de Documentos
- **PDFs**: Extração de texto com PyPDF2
- **TXTs**: Leitura direta com encoding UTF-8/ISO-8859-1
- **XMLs (NF-e)**: 
  - Parsing completo de Notas Fiscais Eletrônicas
  - Extração de: emitente, destinatário, itens, impostos (ICMS, IPI, PIS, COFINS), totais
  - Armazenamento dual: texto formatado (RAG) + JSON estruturado (queries)

### Chat com Contexto
- Histórico de conversa preservado (últimas 6 mensagens)
- Context window para referências anteriores
- Citações numeradas com fontes rastreáveis
- Suporte a metadata filtering por categoria

## 🔒 Segurança e Boas Práticas

- Variáveis de ambiente para credenciais
- Validação de dados com Pydantic
- CORS configurado para desenvolvimento
- Rate limiting (recomendado para produção)
- Input sanitization em uploads

## 📈 Roadmap

- [ ] Migração para PostgreSQL em produção
- [ ] Autenticação e autorização (OAuth2)
- [ ] Suporte a mais tipos de documentos fiscais (CT-e, NFS-e)
- [ ] Exportação de relatórios em Excel/PDF
- [ ] Integração com sistemas ERP
- [ ] Deploy em cloud (AWS/GCP/Azure)
- [ ] Testes automatizados (pytest, jest)
- [ ] CI/CD pipeline

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Abraão Martins** - [AbraaoM](https://github.com/AbraaoM)

## 🙏 Agradecimentos

- Google Gemini pela API de IA
- Comunidade open source das bibliotecas utilizadas
- Contribuidores do projeto

---

**Desenvolvido com ❤️ para facilitar a conformidade fiscal no Brasil**