from sqlalchemy.orm import Session as DBSession
from typing import List, Dict
from fastapi import HTTPException, status, UploadFile
import PyPDF2
import xmltodict
import os
from datetime import datetime

from ..models.document_model import Document
from .vector_service import VectorService
from ..enums.document_category_enum import DocumentCategory
from ..schemas.vector_metadata_schema import VectorMetadata

class DocumentService:
    def __init__(self):
        self.vector_service = VectorService()
        self.upload_dir = "./uploads"
        os.makedirs(self.upload_dir, exist_ok=True)

    def upload_and_process_document(self, db: DBSession, file: UploadFile, category: DocumentCategory, tags: str) -> Dict:
        """Upload e processa um documento"""
        
        # Salva o arquivo
        file_path = os.path.join(self.upload_dir, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Cria registro no banco
        document = Document(
            filename=file.filename,
            file_path=file_path,
            file_type=file.filename.split('.')[-1].lower(),
            file_size=os.path.getsize(file_path),
            status="processing",
            category=category
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        try:
            # Extrai o conteúdo
            content = self._extract_content(file_path, document.file_type)
            
            # Atualiza o conteúdo no banco
            document.content = content

            # Ingere no vector store
            chunk_ids = self.vector_service.ingest_document(
                document_id=document.id,
                content=content,
                metadata=VectorMetadata(
                    filename=document.filename,
                    file_type=document.file_type,
                    category=document.category,
                    tags=tags
                )
            )
            
            # Atualiza status
            document.status = "completed"
            document.chunks_count = len(chunk_ids)
            document.processed_at = datetime.utcnow()
            
            db.commit()
            
            return {
                "id": document.id,
                "filename": document.filename,
                "status": document.status,
                "chunks_count": document.chunks_count,
                "processed_at": document.processed_at
            }
            
        except Exception as e:
            document.status = "error"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing document: {str(e)}"
            )
    
    def _extract_content(self, file_path: str, file_type: str) -> str:
        """Extrai conteúdo baseado no tipo de arquivo"""
        if file_type == "pdf":
            return self._extract_pdf_content(file_path)
        elif file_type == "txt":
            return self._extract_txt_content(file_path)
        elif file_type == "xml":
            return self._extract_xml_content(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
    def _extract_xml_content(self, file_path: str) -> str:
        """Extrai e formata APENAS os dados fiscais essenciais do XML de NF-e"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                xml_content = file.read()
        except UnicodeDecodeError:
            # Tenta com encoding diferente se UTF-8 falhar
            try:
                with open(file_path, 'r', encoding='iso-8859-1') as file:
                    xml_content = file.read()
            except:
                with open(file_path, 'r', encoding='latin-1') as file:
                    xml_content = file.read()
        
        # Remove BOM e caracteres problemáticos no início
        xml_content = xml_content.strip()
        if xml_content.startswith('\ufeff'):
            xml_content = xml_content[1:]
        
        try:
            # Converte XML para dicionário
            data_dict = xmltodict.parse(xml_content)
        except Exception as e:
            # Se falhar, retorna o conteúdo como texto simples
            return f"Erro ao processar XML: {str(e)}\n\nConteúdo original:\n{xml_content[:1000]}..."
        
        # 1. Obter a parte principal da NF-e (caminho varia dependendo do leiaute)
        infNFe = data_dict.get('nfeProc', {}).get('NFe', {}).get('infNFe', {})
        
        if not infNFe: 
            # Tenta outros caminhos comuns
            infNFe = data_dict.get('NFe', {}).get('infNFe', {})
            if not infNFe:
                infNFe = data_dict.get('infNFe', {})
        
        if not infNFe:
            return f"Dados fiscais não encontrados ou estrutura inválida.\n\nEstrutura encontrada: {list(data_dict.keys())}"

        # 2. Extrair dados do cabeçalho (CFOP e Natureza)
        ide = infNFe.get('ide', {})
        summary = f"NOTA FISCAL RESUMO:\n"
        summary += f"Chave de Acesso: {infNFe.get('@Id', 'N/A')}\n"
        summary += f"Natureza da Operação: {ide.get('natOp', 'N/A')}\n"
        summary += f"CFOP Principal: {ide.get('CFOP', 'N/A')}\n"
        
        # 3. Extrair dados dos itens (NCM e valores)
        det = infNFe.get('det', [])
        if not isinstance(det, list): 
            det = [det]  # Garante que seja lista, mesmo com 1 item
        
        for item in det:
            prod = item.get('prod', {})
            imposto = item.get('imposto', {})
            
            # O RAG precisa do NCM e do Valor para a análise
            summary += f"\nITEM NCM: {prod.get('NCM', 'N/A')}\n"
            summary += f"  - Descrição Produto: {prod.get('xProd', 'N/A')}\n"
            summary += f"  - Valor Produto: R$ {prod.get('vProd', 'N/A')}\n"
            
            # O RAG pode usar o CST/CSOSN para buscar regras específicas
            icms_info = imposto.get('ICMS', {}).get('ICMS00', imposto.get('ICMS', {}).get('ICMS90', {}))
            summary += f"  - CST/CSOSN: {icms_info.get('CST', 'N/A')}\n"
        
        print(summary)
            
        return summary.strip()

    def _extract_pdf_content(self, file_path: str) -> str:
        """Extrai texto de PDF"""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    
    def _extract_txt_content(self, file_path: str) -> str:
        """Extrai texto de arquivo TXT"""
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    
    def search_documents(self, query: str, k: int = 5) -> List[Dict]:
        """Busca documentos por similaridade"""
        return self.vector_service.similarity_search(query, k)
    
    def delete_document(self, db: DBSession, document_id: str):
        """Deleta documento do banco e do vector store"""
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Remove do vector store
        self.vector_service.delete_document(document_id)
        
        # Remove arquivo físico
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Remove do banco
        db.delete(document)
        db.commit()
    
    def get_documents(self, db: DBSession, skip: int = 0, limit: int = 100) -> List[Dict]:
        """Lista documentos"""
        documents = db.query(Document).offset(skip).limit(limit).all()
        
        return [
            {
                "id": doc.id,
                "filename": doc.filename,
                "file_type": doc.file_type,
                "file_size": doc.file_size,
                "status": doc.status,
                "chunks_count": doc.chunks_count,
                "created_at": doc.created_at,
                "processed_at": doc.processed_at
            }
            for doc in documents
        ]