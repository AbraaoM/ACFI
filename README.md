# ACFI - Sistema de Chat com IA

Este projeto consiste em um sistema de chat com IA que utiliza FastAPI no backend e Next.js no frontend.

## 🐳 Executando com Docker

### Pré-requisitos
- Docker
- Docker Compose

### Configuração

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd ACFI
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da API do Google Gemini:
```
GEMINI_KEY=sua_chave_api_gemini_aqui
```

3. **Execute os containers:**
```bash
docker-compose up --build
```

### Serviços Disponíveis

- **Frontend (Next.js):** http://localhost:3000
- **Backend (FastAPI):** http://localhost:8000
- **Documentação da API:** http://localhost:8000/docs
- **Banco de dados:** SQLite (arquivo local)

### Comandos Úteis

**Parar os containers:**
```bash
docker-compose down
```

**Parar e remover volumes (limpar dados):**
```bash
docker-compose down -v
```

**Ver logs de um serviço específico:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Executar comandos no container do backend:**
```bash
docker-compose exec backend bash
```

**Executar migrações do banco:**
```bash
docker-compose exec backend alembic upgrade head
```

## 🛠️ Desenvolvimento Local

### Backend (Python 3.9)

1. **Crie um ambiente virtual:**
```bash
cd backend
python3.9 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

4. **Execute as migrações:**
```bash
alembic upgrade head
```

5. **Inicie o servidor:**
```bash
uvicorn app.main:app --reload
```

### Frontend (Node.js)

1. **Instale as dependências:**
```bash
cd frontend
npm install
```

2. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
ACFI/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── controllers/    # Controladores da API
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── services/       # Lógica de negócio
│   │   ├── database.py     # Configuração do banco
│   │   └── main.py         # Aplicação principal
│   ├── alembic/            # Migrações do banco
│   ├── requirements.txt    # Dependências Python
│   └── Dockerfile          # Imagem Docker do backend
├── frontend/               # Interface Next.js
│   ├── src/
│   ├── package.json        # Dependências Node.js
│   └── Dockerfile          # Imagem Docker do frontend
├── docker-compose.yml      # Orquestração dos containers
└── .env.example           # Variáveis de ambiente de exemplo
```

## 🔧 Tecnologias Utilizadas

**Backend:**
- FastAPI
- SQLAlchemy
- Alembic
- SQLite
- Google Gemini AI
- ChromaDB
- LangChain

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- DaisyUI

**Infraestrutura:**
- Docker
- Docker Compose
- SQLite