from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session as DBSession

from ..database import get_db
from ..services.xml_service import XMLService

router = APIRouter(prefix="/xml", tags=["xml"])
xml_service = XMLService()

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
    
    # Delegar o processamento para o service
    return xml_service.upload_and_process_xml(db, file)