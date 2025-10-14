from sqlalchemy.orm import Session as DBSession
from typing import List, Optional
from fastapi import HTTPException, status

from ..models.chat_model import Chat, MessageRole
from ..models.session_model import Session

class ChatService:
    
    @staticmethod
    def create_chat(db: DBSession, session_id: str, role: MessageRole, content: str) -> dict:
        # Verifica se a session exists
        session = db.query(Session).filter(Session.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        chat = Chat(
            session_id=session_id,
            role=role,
            content=content
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        
        return {
            "id": chat.id,
            "session_id": chat.session_id,
            "role": chat.role.value,
            "content": chat.content,
            "created_at": chat.created_at
        }
    
    @staticmethod
    def get_chats_by_session(db: DBSession, session_id: str, skip: int = 0, limit: int = 100) -> List[dict]:
        # Verifica se a session exists
        session = db.query(Session).filter(Session.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        chats = db.query(Chat).filter(Chat.session_id == session_id).offset(skip).limit(limit).all()
        
        return [
            {
                "id": chat.id,
                "session_id": chat.session_id,
                "role": chat.role.value,
                "content": chat.content,
                "created_at": chat.created_at
            }
            for chat in chats
        ]
    
    @staticmethod
    def get_chat_by_id(db: DBSession, chat_id: str) -> dict:
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        return {
            "id": chat.id,
            "session_id": chat.session_id,
            "role": chat.role.value,
            "content": chat.content,
            "created_at": chat.created_at
        }
    
    @staticmethod
    def update_chat(db: DBSession, chat_id: str, content: Optional[str] = None) -> dict:
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        if content is not None:
            chat.content = content
        
        db.commit()
        db.refresh(chat)
        
        return {
            "id": chat.id,
            "session_id": chat.session_id,
            "role": chat.role.value,
            "content": chat.content,
            "created_at": chat.created_at
        }
    
    @staticmethod
    def delete_chat(db: DBSession, chat_id: str) -> None:
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        db.delete(chat)
        db.commit()