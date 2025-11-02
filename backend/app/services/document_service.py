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
        """Extrai e formata dados completos do XML de NF-e para análise RAG"""
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

        # 2. CABEÇALHO DA NOTA
        ide = infNFe.get('ide', {})
        summary = "=== NOTA FISCAL ELETRÔNICA ===\n\n"
        summary += f"Chave de Acesso: {infNFe.get('@Id', 'N/A').replace('NFe', '')}\n"
        summary += f"Número: {ide.get('nNF', 'N/A')}\n"
        summary += f"Série: {ide.get('serie', 'N/A')}\n"
        summary += f"Modelo: {ide.get('mod', 'N/A')}\n"
        summary += f"Data de Emissão: {ide.get('dhEmi', 'N/A')}\n"
        summary += f"Data de Saída/Entrada: {ide.get('dhSaiEnt', ide.get('dhEmi', 'N/A'))}\n"
        summary += f"Natureza da Operação: {ide.get('natOp', 'N/A')}\n"
        summary += f"Tipo de Operação: {'Saída' if ide.get('tpNF') == '1' else 'Entrada' if ide.get('tpNF') == '0' else 'N/A'}\n"
        summary += f"Finalidade: {ide.get('finNFe', 'N/A')}\n"
        summary += f"CFOP Principal: {ide.get('CFOP', 'N/A')}\n\n"
        
        # 3. EMITENTE
        emit = infNFe.get('emit', {})
        enderEmit = emit.get('enderEmit', {})
        summary += "--- EMITENTE ---\n"
        summary += f"CNPJ: {emit.get('CNPJ', 'N/A')}\n"
        summary += f"Razão Social: {emit.get('xNome', 'N/A')}\n"
        summary += f"Nome Fantasia: {emit.get('xFant', 'N/A')}\n"
        summary += f"IE: {emit.get('IE', 'N/A')}\n"
        summary += f"Endereço: {enderEmit.get('xLgr', 'N/A')}, {enderEmit.get('nro', 'N/A')}\n"
        summary += f"Bairro: {enderEmit.get('xBairro', 'N/A')}\n"
        summary += f"Município: {enderEmit.get('xMun', 'N/A')} - {enderEmit.get('UF', 'N/A')}\n"
        summary += f"CEP: {enderEmit.get('CEP', 'N/A')}\n\n"
        
        # 4. DESTINATÁRIO
        dest = infNFe.get('dest', {})
        enderDest = dest.get('enderDest', {})
        summary += "--- DESTINATÁRIO ---\n"
        summary += f"CNPJ/CPF: {dest.get('CNPJ', dest.get('CPF', 'N/A'))}\n"
        summary += f"Nome/Razão Social: {dest.get('xNome', 'N/A')}\n"
        summary += f"IE: {dest.get('IE', dest.get('indIEDest', 'N/A'))}\n"
        summary += f"Endereço: {enderDest.get('xLgr', 'N/A')}, {enderDest.get('nro', 'N/A')}\n"
        summary += f"Bairro: {enderDest.get('xBairro', 'N/A')}\n"
        summary += f"Município: {enderDest.get('xMun', 'N/A')} - {enderDest.get('UF', 'N/A')}\n"
        summary += f"CEP: {enderDest.get('CEP', 'N/A')}\n\n"
        
        # 5. PRODUTOS/SERVIÇOS
        det = infNFe.get('det', [])
        if not isinstance(det, list): 
            det = [det]
        
        summary += "--- PRODUTOS/SERVIÇOS ---\n"
        for idx, item in enumerate(det, 1):
            prod = item.get('prod', {})
            imposto = item.get('imposto', {})
            
            summary += f"\nItem {idx}:\n"
            summary += f"  Código: {prod.get('cProd', 'N/A')}\n"
            summary += f"  Descrição: {prod.get('xProd', 'N/A')}\n"
            summary += f"  NCM: {prod.get('NCM', 'N/A')}\n"
            summary += f"  CFOP: {prod.get('CFOP', 'N/A')}\n"
            summary += f"  Unidade Comercial: {prod.get('uCom', 'N/A')}\n"
            summary += f"  Quantidade: {prod.get('qCom', 'N/A')}\n"
            summary += f"  Valor Unitário: R$ {prod.get('vUnCom', 'N/A')}\n"
            summary += f"  Valor Total: R$ {prod.get('vProd', 'N/A')}\n"
            
            # IMPOSTOS DETALHADOS
            summary += f"  IMPOSTOS:\n"
            
            # ICMS
            icms = imposto.get('ICMS', {})
            icms_detail = None
            for key in icms.keys():
                if key.startswith('ICMS'):
                    icms_detail = icms[key]
                    break
            
            if icms_detail:
                summary += f"    ICMS:\n"
                summary += f"      Origem: {icms_detail.get('orig', 'N/A')}\n"
                summary += f"      CST/CSOSN: {icms_detail.get('CST', icms_detail.get('CSOSN', 'N/A'))}\n"
                summary += f"      Modalidade BC: {icms_detail.get('modBC', 'N/A')}\n"
                summary += f"      Base de Cálculo: R$ {icms_detail.get('vBC', '0.00')}\n"
                summary += f"      Alíquota: {icms_detail.get('pICMS', '0.00')}%\n"
                summary += f"      Valor ICMS: R$ {icms_detail.get('vICMS', '0.00')}\n"
            
            # IPI
            ipi = imposto.get('IPI', {})
            if ipi:
                ipi_trib = ipi.get('IPITrib', {})
                if ipi_trib:
                    summary += f"    IPI:\n"
                    summary += f"      CST: {ipi_trib.get('CST', 'N/A')}\n"
                    summary += f"      Base de Cálculo: R$ {ipi_trib.get('vBC', '0.00')}\n"
                    summary += f"      Alíquota: {ipi_trib.get('pIPI', '0.00')}%\n"
                    summary += f"      Valor IPI: R$ {ipi_trib.get('vIPI', '0.00')}\n"
            
            # PIS
            pis = imposto.get('PIS', {})
            pis_detail = None
            for key in pis.keys():
                if key.startswith('PIS'):
                    pis_detail = pis[key]
                    break
            
            if pis_detail:
                summary += f"    PIS:\n"
                summary += f"      CST: {pis_detail.get('CST', 'N/A')}\n"
                summary += f"      Base de Cálculo: R$ {pis_detail.get('vBC', '0.00')}\n"
                summary += f"      Alíquota: {pis_detail.get('pPIS', '0.00')}%\n"
                summary += f"      Valor PIS: R$ {pis_detail.get('vPIS', '0.00')}\n"
            
            # COFINS
            cofins = imposto.get('COFINS', {})
            cofins_detail = None
            for key in cofins.keys():
                if key.startswith('COFINS'):
                    cofins_detail = cofins[key]
                    break
            
            if cofins_detail:
                summary += f"    COFINS:\n"
                summary += f"      CST: {cofins_detail.get('CST', 'N/A')}\n"
                summary += f"      Base de Cálculo: R$ {cofins_detail.get('vBC', '0.00')}\n"
                summary += f"      Alíquota: {cofins_detail.get('pCOFINS', '0.00')}%\n"
                summary += f"      Valor COFINS: R$ {cofins_detail.get('vCOFINS', '0.00')}\n"
        
        # 6. TOTAIS
        total = infNFe.get('total', {}).get('ICMSTot', {})
        summary += "\n--- TOTAIS DA NOTA ---\n"
        summary += f"Base de Cálculo ICMS: R$ {total.get('vBC', '0.00')}\n"
        summary += f"Valor ICMS: R$ {total.get('vICMS', '0.00')}\n"
        summary += f"Valor ICMS Desonerado: R$ {total.get('vICMSDeson', '0.00')}\n"
        summary += f"Base de Cálculo ICMS ST: R$ {total.get('vBCST', '0.00')}\n"
        summary += f"Valor ICMS ST: R$ {total.get('vST', '0.00')}\n"
        summary += f"Valor Total dos Produtos: R$ {total.get('vProd', '0.00')}\n"
        summary += f"Valor do Frete: R$ {total.get('vFrete', '0.00')}\n"
        summary += f"Valor do Seguro: R$ {total.get('vSeg', '0.00')}\n"
        summary += f"Valor do Desconto: R$ {total.get('vDesc', '0.00')}\n"
        summary += f"Valor do IPI: R$ {total.get('vIPI', '0.00')}\n"
        summary += f"Valor do PIS: R$ {total.get('vPIS', '0.00')}\n"
        summary += f"Valor do COFINS: R$ {total.get('vCOFINS', '0.00')}\n"
        summary += f"Outras Despesas: R$ {total.get('vOutro', '0.00')}\n"
        summary += f"VALOR TOTAL DA NOTA: R$ {total.get('vNF', '0.00')}\n"
        
        # 7. INFORMAÇÕES ADICIONAIS
        infAdic = infNFe.get('infAdic', {})
        if infAdic:
            summary += "\n--- INFORMAÇÕES ADICIONAIS ---\n"
            if infAdic.get('infCpl'):
                summary += f"{infAdic.get('infCpl')}\n"
            if infAdic.get('infAdFisco'):
                summary += f"Informações Fiscais: {infAdic.get('infAdFisco')}\n"
        
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
                "processed_at": doc.processed_at,
                "category": doc.category.value
            }
            for doc in documents
        ]