from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Retorna estatísticas básicas do sistema para o dashboard
    """
    dashboard_service = DashboardService(db)
    return dashboard_service.get_system_stats()

@router.get("/recent-activity")
def get_recent_activity(limit: int = 10, db: Session = Depends(get_db)):
    """
    Retorna atividade recente do sistema
    """
    dashboard_service = DashboardService(db)
    return {
        "recent_chats": dashboard_service.get_recent_chats(limit)
    }

@router.get("/documents-by-category")
def get_documents_by_category(db: Session = Depends(get_db)):
    """
    Retorna distribuição de documentos por categoria
    """
    dashboard_service = DashboardService(db)
    return {
        "documents_by_category": dashboard_service.get_documents_by_category()
    }

@router.get("/activity-by-day")
def get_activity_by_day(days: int = 7, db: Session = Depends(get_db)):
    """
    Retorna atividade dos últimos dias
    """
    dashboard_service = DashboardService(db)
    return {
        "activity": dashboard_service.get_activity_by_day(days)
    }

@router.get("/most-active-sessions")
def get_most_active_sessions(limit: int = 5, db: Session = Depends(get_db)):
    """
    Retorna as sessões mais ativas
    """
    dashboard_service = DashboardService(db)
    return {
        "active_sessions": dashboard_service.get_most_active_sessions(limit)
    }