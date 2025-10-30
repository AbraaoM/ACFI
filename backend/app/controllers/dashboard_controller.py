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

# === ENDPOINTS ESPECÍFICOS PARA NOTAS FISCAIS ===

@router.get("/nfe/statistics")
def get_nfe_statistics(db: Session = Depends(get_db)):
    """
    Retorna estatísticas das notas fiscais processadas
    """
    dashboard_service = DashboardService(db)
    return dashboard_service.get_nfe_statistics()

@router.get("/nfe/cfop-distribution")
def get_nfe_cfop_distribution(db: Session = Depends(get_db)):
    """
    Retorna distribuição de CFOPs das notas fiscais
    """
    dashboard_service = DashboardService(db)
    return {
        "cfop_distribution": dashboard_service.get_nfe_cfop_distribution()
    }

@router.get("/nfe/ncm-top")
def get_nfe_ncm_top(limit: int = 10, db: Session = Depends(get_db)):
    """
    Retorna os NCMs mais frequentes nas notas fiscais
    """
    dashboard_service = DashboardService(db)
    return {
        "top_ncms": dashboard_service.get_nfe_ncm_top(limit)
    }

@router.get("/nfe/values-summary")
def get_nfe_values_summary(db: Session = Depends(get_db)):
    """
    Retorna resumo dos valores das notas fiscais
    """
    dashboard_service = DashboardService(db)
    return dashboard_service.get_nfe_values_summary()

@router.get("/nfe/processing-timeline")
def get_nfe_processing_timeline(days: int = 30, db: Session = Depends(get_db)):
    """
    Retorna timeline de processamento de notas fiscais
    """
    dashboard_service = DashboardService(db)
    return {
        "timeline": dashboard_service.get_nfe_processing_timeline(days)
    }

@router.get("/nfe/error-analysis")
def get_nfe_error_analysis(db: Session = Depends(get_db)):
    """
    Retorna análise de erros no processamento de notas fiscais
    """
    dashboard_service = DashboardService(db)
    return dashboard_service.get_nfe_error_analysis()

@router.get("/nfe/overview")
def get_nfe_overview(db: Session = Depends(get_db)):
    """
    Retorna um resumo completo das notas fiscais para o dashboard
    """
    dashboard_service = DashboardService(db)
    return {
        "statistics": dashboard_service.get_nfe_statistics(),
        "values_summary": dashboard_service.get_nfe_values_summary(),
        "top_cfops": dashboard_service.get_nfe_cfop_distribution()[:5],
        "top_ncms": dashboard_service.get_nfe_ncm_top(5),
        "error_analysis": dashboard_service.get_nfe_error_analysis()
    }