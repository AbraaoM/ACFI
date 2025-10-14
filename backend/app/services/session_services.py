from sqlalchemy.orm import Session as DBSession
from typing import List, Optional
from fastapi import HTTPException, status

from ..models.session_model import Session

class SessionService:
    
    @staticmethod
    def create_session(db: DBSession, name: str, description: Optional[str] = None) -> dict:
        session = Session(
            name=name,
            description=description
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return {
            "id": session.id,
            "name": session.name,
            "description": session.description,
            "created_at": session.created_at,
            "updated_at": session.updated_at
        }
    
    @staticmethod
    def get_sessions(db: DBSession, skip: int = 0, limit: int = 100) -> List[dict]:
        sessions = db.query(Session).offset(skip).limit(limit).all()
        
        return [
            {
                "id": session.id,
                "name": session.name,
                "description": session.description,
                "created_at": session.created_at,
                "updated_at": session.updated_at
            }
            for session in sessions
        ]
    
    @staticmethod
    def get_session_by_id(db: DBSession, session_id: str) -> dict:
        session = db.query(Session).filter(Session.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        return {
            "id": session.id,
            "name": session.name,
            "description": session.description,
            "created_at": session.created_at,
            "updated_at": session.updated_at
        }
    
    @staticmethod
    def update_session(
        db: DBSession, 
        session_id: str, 
        name: Optional[str] = None, 
        description: Optional[str] = None
    ) -> dict:
        session = db.query(Session).filter(Session.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        if name is not None:
            session.name = name
        if description is not None:
            session.description = description
        
        db.commit()
        db.refresh(session)
        
        return {
            "id": session.id,
            "name": session.name,
            "description": session.description,
            "created_at": session.created_at,
            "updated_at": session.updated_at
        }
    
    @staticmethod
    def delete_session(db: DBSession, session_id: str) -> None:
        session = db.query(Session).filter(Session.id == session_id).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        db.delete(session)
        db.commit()