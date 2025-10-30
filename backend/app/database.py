from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Caminho para o banco SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/TRIBUT.AI.sqlite")

# Cria o diretório data se não existir
os.makedirs("data", exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Necessário para SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency para injetar a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()