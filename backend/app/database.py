from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Caminho para o banco SQLite
DATABASE_URL = "sqlite:///./data/acfi.sqlite"

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