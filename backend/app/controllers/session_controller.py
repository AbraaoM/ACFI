from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as DBSession
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..services.session_services import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])

class SessionCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None

# CREATE
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_session(request: SessionCreateRequest, db: DBSession = Depends(get_db)):
    return SessionService.create_session(db, request.name, request.description)

# READ ALL
@router.get("/", response_model=List[dict])
def get_sessions(skip: int = 0, limit: int = 100, db: DBSession = Depends(get_db)):
    return SessionService.get_sessions(db, skip, limit)

# READ ONE
@router.get("/{session_id}", response_model=dict)
def get_session(session_id: str, db: DBSession = Depends(get_db)):
    return SessionService.get_session_by_id(db, session_id)

# UPDATE
@router.put("/{session_id}", response_model=dict)
def update_session(
    session_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    db: DBSession = Depends(get_db)
):
    return SessionService.update_session(db, session_id, name, description)

# DELETE
@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str, db: DBSession = Depends(get_db)):
    return SessionService.delete_session(db, session_id)