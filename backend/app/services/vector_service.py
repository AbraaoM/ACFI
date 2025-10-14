import chromadb
from chromadb.config import Settings
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict, Any
import os

class VectorService:
    def __init__(self):
        # Diretório para persistir o ChromaDB
        self.persist_directory = "./data/chroma_db"
        os.makedirs(self.persist_directory, exist_ok=True)
        
        # Embeddings usando modelo local (gratuito)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # ChromaDB client
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        
        # Vector store
        self.vectorstore = Chroma(
            client=self.client,
            collection_name="documents",
            embedding_function=self.embeddings,
        )
        
        # Text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
    
    def ingest_document(self, document_id: str, content: str, metadata: Dict[str, Any] = None) -> List[str]:
        """Ingere um documento no vector store"""
        if metadata is None:
            metadata = {}
        
        # Adiciona o document_id aos metadados
        metadata["document_id"] = document_id
        
        # Divide o texto em chunks
        chunks = self.text_splitter.split_text(content)
        
        # Adiciona metadados específicos para cada chunk
        metadatas = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = metadata.copy()
            chunk_metadata["chunk_index"] = i
            chunk_metadata["chunk_id"] = f"{document_id}_chunk_{i}"
            metadatas.append(chunk_metadata)
        
        # Adiciona os chunks ao vector store
        ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
        self.vectorstore.add_texts(
            texts=chunks,
            metadatas=metadatas,
            ids=ids
        )
        
        return ids
    
    def similarity_search(self, query: str, k: int = 5, filter_metadata: Dict = None) -> List[Dict]:
        """Busca por similaridade no vector store"""
        results = self.vectorstore.similarity_search_with_score(
            query=query,
            k=k,
            filter=filter_metadata
        )
        
        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score
            }
            for doc, score in results
        ]
    
    def delete_document(self, document_id: str):
        """Remove todos os chunks de um documento"""
        # Busca todos os chunks do documento
        collection = self.client.get_collection("documents")
        results = collection.get(where={"document_id": document_id})
        
        if results["ids"]:
            collection.delete(ids=results["ids"])
    
    def get_collection_info(self) -> Dict:
        """Retorna informações sobre a collection"""
        collection = self.client.get_collection("documents")
        return {
            "count": collection.count(),
            "name": collection.name
        }