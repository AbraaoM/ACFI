from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session as DBSession

from ..database import get_db

router = APIRouter(prefix="/xml", tags=["xml"])

@router.post("/upload", response_model=dict, status_code=status.HTTP_201_CREATED)
def upload_xml(
    file: UploadFile = File(...),
    db: DBSession = Depends(get_db)
):
    """Upload e processa um arquivo XML"""
    
    # Validar se o arquivo é XML
    if not file.filename.lower().endswith('.xml'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo deve ter extensão .xml"
        )
    
    # Validar content type
    if file.content_type not in ["application/xml", "text/xml"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de arquivo deve ser XML"
        )
    
    try:
        # Ler o conteúdo do arquivo
        content = file.file.read()
        
        # Aqui você pode adicionar processamento específico do XML
        # Por exemplo: validar estrutura, extrair dados, etc.
        
        return {
            "message": "Arquivo XML processado com sucesso",
            "filename": file.filename,
            "size": len(content),
            "content_type": file.content_type
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar arquivo XML: {str(e)}"
        )
    finally:
        file.file.close()