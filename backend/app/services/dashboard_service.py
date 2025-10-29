from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..models.document_model import Document
from ..models.chat_model import Chat
from ..models.session_model import Session as SessionModel
from datetime import datetime, timedelta

class DashboardService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_system_stats(self):
        """
        Retorna estatísticas básicas do sistema
        """
        total_documents = self.db.query(Document).count()
        total_chats = self.db.query(Chat).count()
        total_sessions = self.db.query(SessionModel).count()
        
        return {
            "total_documents": total_documents,
            "total_chats": total_chats,
            "total_sessions": total_sessions
        }
    
    def get_recent_chats(self, limit: int = 10):
        """
        Retorna os chats mais recentes
        """
        recent_chats = (
            self.db.query(Chat)
            .order_by(desc(Chat.created_at))
            .limit(limit)
            .all()
        )
        
        return [
            {
                "id": chat.id,
                "question": chat.question[:100] + "..." if len(chat.question) > 100 else chat.question,
                "created_at": chat.created_at.isoformat() if chat.created_at else None,
                "session_id": chat.session_id
            }
            for chat in recent_chats
        ]
    
    def get_documents_by_category(self):
        """
        Retorna distribuição de documentos por categoria
        """
        distribution = (
            self.db.query(
                Document.category,
                func.count(Document.id).label('count')
            )
            .group_by(Document.category)
            .all()
        )
        
        return [
            {
                "category": category.value if category else "Sem categoria",
                "count": count
            }
            for category, count in distribution
        ]
    
    def get_activity_by_day(self, days: int = 7):
        """
        Retorna atividade dos últimos dias
        """
        start_date = datetime.now() - timedelta(days=days)
        
        activity = (
            self.db.query(
                func.date(Chat.created_at).label('date'),
                func.count(Chat.id).label('chat_count')
            )
            .filter(Chat.created_at >= start_date)
            .group_by(func.date(Chat.created_at))
            .order_by(func.date(Chat.created_at))
            .all()
        )
        
        return [
            {
                "date": str(date),
                "chat_count": count
            }
            for date, count in activity
        ]
    
    def get_most_active_sessions(self, limit: int = 5):
        """
        Retorna as sessões mais ativas (com mais chats)
        """
        active_sessions = (
            self.db.query(
                SessionModel.id,
                SessionModel.session_name,
                func.count(Chat.id).label('chat_count')
            )
            .join(Chat, SessionModel.id == Chat.session_id)
            .group_by(SessionModel.id, SessionModel.session_name)
            .order_by(desc(func.count(Chat.id)))
            .limit(limit)
            .all()
        )
        
        return [
            {
                "session_id": session_id,
                "session_name": session_name,
                "chat_count": chat_count
            }
            for session_id, session_name, chat_count in active_sessions
        ]