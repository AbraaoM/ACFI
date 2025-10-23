from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import xml.etree.ElementTree as ET
import os
import uuid
from datetime import datetime
import aiofiles
from pathlib import Path

# Imports dos modelos e serviços (ajustar conforme sua estrutura)
from app.models.document import Document, DocumentCreate, DocumentUpdate
from app.services.xml_service import XMLService
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/xml", tags=["XML"])

# Configurações
UPLOAD_DIR = Path("uploads/xml")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {".xml", ".XML"}

class XMLController:
    def __init__(self):
        self.xml_service = XMLService()

    async def validate_xml_file(self, file: UploadFile) -> bool:
        """Valida se o arquivo é um XML válido"""
        try:
            # Verificar extensão
            file_extension = Path(file.filename).suffix
            if file_extension not in ALLOWED_EXTENSIONS:
                return False
            
            # Verificar tamanho
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                return False
            
            # Validar XML
            ET.fromstring(content)
            
            # Resetar posição do arquivo
            await file.seek(0)
            return True
            
        except ET.ParseError:
            return False
        except Exception:
            return False

    async def save_uploaded_file(self, file: UploadFile) -> str:
        """Salva o arquivo XML no servidor"""
        try:
            # Gerar nome único
            file_extension = Path(file.filename).suffix
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = UPLOAD_DIR / unique_filename
            
            # Salvar arquivo
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            return str(file_path)
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao salvar arquivo: {str(e)}"
            )

xml_controller = XMLController()

@router.post("/upload", response_model=dict)
async def upload_xml_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form("fiscal"),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload de arquivo XML
    
    - **file**: Arquivo XML para upload
    - **title**: Título do documento (opcional)
    - **description**: Descrição do documento (opcional)
    - **category**: Categoria do documento (padrão: fiscal)
    """
    try:
        # Validar arquivo
        if not await xml_controller.validate_xml_file(file):
            raise HTTPException(
                status_code=400,
                detail="Arquivo XML inválido ou muito grande"
            )
        
        # Salvar arquivo
        file_path = await xml_controller.save_uploaded_file(file)
        
        # Processar XML
        xml_data = await xml_controller.xml_service.process_xml(file_path)
        
        # Criar documento no banco
        document_data = DocumentCreate(
            title=title or file.filename,
            description=description or f"XML uploaded: {file.filename}",
            file_path=file_path,
            file_type="xml",
            category=category,
            metadata=xml_data.get("metadata", {}),
            content_preview=xml_data.get("preview", "")[:500]
        )
        
        document = await xml_controller.xml_service.create_document(db, document_data)
        
        return {
            "success": True,
            "message": "Arquivo XML enviado com sucesso",
            "document_id": document.id,
            "filename": file.filename,
            "file_size": len(await file.read()) if hasattr(file, 'size') else 0,
            "xml_data": xml_data,
            "processed_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.post("/upload/multiple", response_model=dict)
async def upload_multiple_xml_files(
    files: List[UploadFile] = File(...),
    category: Optional[str] = Form("fiscal"),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload de múltiplos arquivos XML
    
    - **files**: Lista de arquivos XML
    - **category**: Categoria dos documentos
    """
    try:
        if len(files) > 10:  # Limite de 10 arquivos por vez
            raise HTTPException(
                status_code=400,
                detail="Máximo de 10 arquivos por upload"
            )
        
        results = []
        errors = []
        
        for file in files:
            try:
                # Validar arquivo
                if not await xml_controller.validate_xml_file(file):
                    errors.append({
                        "filename": file.filename,
                        "error": "Arquivo XML inválido"
                    })
                    continue
                
                # Salvar arquivo
                file_path = await xml_controller.save_uploaded_file(file)
                
                # Processar XML
                xml_data = await xml_controller.xml_service.process_xml(file_path)
                
                # Criar documento
                document_data = DocumentCreate(
                    title=file.filename,
                    description=f"XML uploaded: {file.filename}",
                    file_path=file_path,
                    file_type="xml",
                    category=category,
                    metadata=xml_data.get("metadata", {}),
                    content_preview=xml_data.get("preview", "")[:500]
                )
                
                document = await xml_controller.xml_service.create_document(db, document_data)
                
                results.append({
                    "document_id": document.id,
                    "filename": file.filename,
                    "xml_data": xml_data
                })
                
            except Exception as e:
                errors.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {
            "success": True,
            "message": f"Processados {len(results)} arquivos com sucesso",
            "results": results,
            "errors": errors,
            "total_files": len(files),
            "successful": len(results),
            "failed": len(errors)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/parse/{document_id}", response_model=dict)
async def parse_xml_document(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Parsing detalhado de um documento XML específico
    
    - **document_id**: ID do documento XML
    """
    try:
        # Buscar documento
        document = await xml_controller.xml_service.get_document(db, document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Documento não encontrado")
        
        if document.file_type != "xml":
            raise HTTPException(status_code=400, detail="Documento não é um XML")
        
        # Fazer parsing detalhado
        parsed_data = await xml_controller.xml_service.detailed_parse(document.file_path)
        
        return {
            "success": True,
            "document_id": document_id,
            "parsed_data": parsed_data,
            "document_info": {
                "title": document.title,
                "description": document.description,
                "created_at": document.created_at.isoformat(),
                "category": document.category
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao fazer parsing: {str(e)}"
        )

@router.get("/validate/{document_id}", response_model=dict)
async def validate_xml_document(
    document_id: str,
    schema_path: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Validação de documento XML contra esquema
    
    - **document_id**: ID do documento XML
    - **schema_path**: Caminho para o esquema XSD (opcional)
    """
    try:
        # Buscar documento
        document = await xml_controller.xml_service.get_document(db, document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Documento não encontrado")
        
        # Validar XML
        validation_result = await xml_controller.xml_service.validate_xml(
            document.file_path, 
            schema_path
        )
        
        return {
            "success": True,
            "document_id": document_id,
            "validation": validation_result,
            "is_valid": validation_result.get("is_valid", False),
            "errors": validation_result.get("errors", []),
            "warnings": validation_result.get("warnings", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro na validação: {str(e)}"
        )

@router.delete("/delete/{document_id}", response_model=dict)
async def delete_xml_document(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Deletar documento XML e arquivo associado
    
    - **document_id**: ID do documento a ser deletado
    """
    try:
        # Buscar documento
        document = await xml_controller.xml_service.get_document(db, document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Documento não encontrado")
        
        # Deletar arquivo físico
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Deletar registro do banco
        await xml_controller.xml_service.delete_document(db, document_id)
        
        return {
            "success": True,
            "message": "Documento XML deletado com sucesso",
            "document_id": document_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao deletar: {str(e)}"
        )

@router.get("/list", response_model=dict)
async def list_xml_documents(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Listar documentos XML
    
    - **skip**: Número de registros para pular
    - **limit**: Número máximo de registros
    - **category**: Filtrar por categoria
    """
    try:
        documents = await xml_controller.xml_service.list_documents(
            db, 
            skip=skip, 
            limit=limit, 
            file_type="xml",
            category=category
        )
        
        return {
            "success": True,
            "documents": documents,
            "total": len(documents),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar documentos: {str(e)}"
        )

@router.get("/info/{document_id}", response_model=dict)
async def get_xml_info(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Obter informações detalhadas de um documento XML
    
    - **document_id**: ID do documento
    """
    try:
        document = await xml_controller.xml_service.get_document(db, document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Documento não encontrado")
        
        # Obter estatísticas do arquivo
        file_stats = await xml_controller.xml_service.get_file_stats(document.file_path)
        
        return {
            "success": True,
            "document": {
                "id": document.id,
                "title": document.title,
                "description": document.description,
                "category": document.category,
                "file_type": document.file_type,
                "created_at": document.created_at.isoformat(),
                "updated_at": document.updated_at.isoformat(),
                "metadata": document.metadata,
                "content_preview": document.content_preview
            },
            "file_stats": file_stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao obter informações: {str(e)}"
        )