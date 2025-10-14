from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as DBSession
from typing import List, Optional

from ..database import get_db
from ..services.chat_service import ChatService
from ..models.chat_model import MessageRole

router = APIRouter(prefix="/chats", tags=["chats"])

# CREATE
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_chat(
    session_id: str, 
    role: MessageRole, 
    content: str, 
    db: DBSession = Depends(get_db)
):
    return ChatService.create_chat(db, session_id, role, content)

# READ ALL BY SESSION
@router.get("/session/{session_id}", response_model=List[dict])
def get_chats_by_session(
    session_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    db: DBSession = Depends(get_db)
):
    return ChatService.get_chats_by_session(db, session_id, skip, limit)

# READ ONE
@router.get("/{chat_id}", response_model=dict)
def get_chat(chat_id: str, db: DBSession = Depends(get_db)):
    return ChatService.get_chat_by_id(db, chat_id)

# UPDATE
@router.put("/{chat_id}", response_model=dict)
def update_chat(
    chat_id: str,
    content: Optional[str] = None,
    db: DBSession = Depends(get_db)
):
    return ChatService.update_chat(db, chat_id, content)

# DELETE
@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(chat_id: str, db: DBSession = Depends(get_db)):
    return ChatService.delete_chat(db, chat_id)