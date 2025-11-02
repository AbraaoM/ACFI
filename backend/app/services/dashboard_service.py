from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..models.document_model import Document
from ..models.chat_model import Chat
from ..models.session_model import Session as SessionModel
from ..enums.document_category_enum import DocumentCategory
from datetime import datetime, timedelta
import json
import re

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
    
    def get_nfe_statistics(self):
        """
        Retorna estatísticas das notas fiscais processadas
        """
        nfe_documents = self.db.query(Document).filter(
            Document.category == DocumentCategory.NOTAS_FISCAIS
        ).all()
        
        total_nfes = len(nfe_documents)
        processed_nfes = len([doc for doc in nfe_documents if doc.status == "completed"])
        error_nfes = len([doc for doc in nfe_documents if doc.status == "error"])
        
        total_chunks = sum(doc.chunks_count for doc in nfe_documents if doc.chunks_count)
        avg_chunks = total_chunks / total_nfes if total_nfes > 0 else 0
        
        return {
            "total_nfes": total_nfes,
            "processed_nfes": processed_nfes,
            "error_nfes": error_nfes,
            "processing_rate": (processed_nfes / total_nfes * 100) if total_nfes > 0 else 0,
            "total_chunks": total_chunks,
            "avg_chunks_per_nfe": round(avg_chunks, 2)
        }
    
    def get_nfe_cfop_distribution(self):
        """
        Extrai e analisa a distribuição de CFOPs das notas fiscais
        """
        nfe_documents = self.db.query(Document).filter(
            Document.category == DocumentCategory.NOTAS_FISCAIS,
            Document.status == "completed",
            Document.content.isnot(None)
        ).all()
        
        cfop_count = {}
        
        for doc in nfe_documents:
            if doc.content:
                # Extrai CFOP do conteúdo processado
                cfop_match = re.search(r'CFOP Principal: (\d+)', doc.content)
                if cfop_match:
                    cfop = cfop_match.group(1)
                    cfop_count[cfop] = cfop_count.get(cfop, 0) + 1
        
        return [
            {"cfop": cfop, "count": count}
            for cfop, count in sorted(cfop_count.items(), key=lambda x: x[1], reverse=True)
        ]
    
    def get_nfe_ncm_top(self, limit: int = 10):
        """
        Retorna os NCMs mais frequentes nas notas fiscais
        """
        nfe_documents = self.db.query(Document).filter(
            Document.category == DocumentCategory.NOTAS_FISCAIS,
            Document.status == "completed",
            Document.content.isnot(None)
        ).all()
        
        ncm_count = {}
        
        for doc in nfe_documents:
            if doc.content:
                print(f"Processing document: {doc.filename}")
                print(f"Content preview: {doc.content[:500]}")  # Debug
                
                # Tenta diferentes padrões de regex
                # Padrão 1: ITEM X NCM: 12345678
                ncm_matches = re.findall(r'ITEM \d+:\s*\n\s*- CFOP: \d+\s*\n\s*- Descrição Produto: [^\n]+\s*\n\s*- Valor Produto: R\$ [\d,\.]+', doc.content)
                
                # Se não encontrar, tenta padrão mais simples
                if not ncm_matches:
                    ncm_matches = re.findall(r'NCM[:\s]+(\d{8})', doc.content)
                
                # Padrão original como fallback
                if not ncm_matches:
                    ncm_matches = re.findall(r'ITEM \d+ NCM: (\d+)', doc.content)
                
                print(f"Found NCMs: {ncm_matches}")  # Debug
                
                for ncm in ncm_matches:
                    if ncm != "N/A" and ncm.isdigit():
                        ncm_count[ncm] = ncm_count.get(ncm, 0) + 1
        
        print(f"NCM Count: {ncm_count}")  # Debug
        
        # Retorna os top NCMs
        top_ncms = sorted(ncm_count.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        return [
            {"ncm": ncm, "count": count}
            for ncm, count in top_ncms
        ]
    
    def get_nfe_values_summary(self):
        """
        Retorna resumo dos valores das notas fiscais
        """
        nfe_documents = self.db.query(Document).filter(
            Document.category == DocumentCategory.NOTAS_FISCAIS,
            Document.status == "completed",
            Document.content.isnot(None)
        ).all()
        
        total_value = 0
        nfe_count = 0
        values = []
        
        for doc in nfe_documents:
            if doc.content:
                # Extrai valores dos produtos
                value_matches = re.findall(r'Valor Produto: R\$ ([\d,\.]+)', doc.content)
                nfe_total = 0
                
                for value_str in value_matches:
                    if value_str != "N/A":
                        try:
                            # Converte string para float (assume formato brasileiro)
                            value = float(value_str.replace(',', '.'))
                            nfe_total += value
                        except ValueError:
                            continue
                
                if nfe_total > 0:
                    values.append(nfe_total)
                    total_value += nfe_total
                    nfe_count += 1
        
        return {
            "total_value": round(total_value, 2),
            "nfe_count": nfe_count,
            "average_value": round(total_value / nfe_count, 2) if nfe_count > 0 else 0,
            "max_value": round(max(values), 2) if values else 0,
            "min_value": round(min(values), 2) if values else 0
        }
    
    def get_nfe_processing_timeline(self, days: int = 30):
        """
        Retorna timeline de processamento de notas fiscais
        """
        start_date = datetime.now() - timedelta(days=days)
        
        nfe_timeline = (
            self.db.query(
                func.date(Document.created_at).label('date'),
                func.count(Document.id).label('nfe_count')
            )
            .filter(
                Document.category == DocumentCategory.NOTAS_FISCAIS,
                Document.created_at >= start_date
            )
            .group_by(func.date(Document.created_at))
            .order_by(func.date(Document.created_at))
            .all()
        )
        
        return [
            {
                "date": str(date),
                "nfe_count": count
            }
            for date, count in nfe_timeline
        ]
    
    def get_nfe_error_analysis(self):
        """
        Analisa os erros no processamento de notas fiscais
        """
        error_nfes = self.db.query(Document).filter(
            Document.category == DocumentCategory.NOTAS_FISCAIS,
            Document.status == "error"
        ).all()
        
        error_patterns = {}
        
        for doc in error_nfes:
            # Aqui você poderia analisar logs de erro específicos
            # Por agora, vamos categorizar por tipo de arquivo
            file_type = doc.file_type
            error_patterns[file_type] = error_patterns.get(file_type, 0) + 1
        
        return {
            "total_errors": len(error_nfes),
            "error_by_type": [
                {"file_type": file_type, "count": count}
                for file_type, count in error_patterns.items()
            ],
            "error_rate": len(error_nfes) / self.db.query(Document).filter(
                Document.category == DocumentCategory.NOTAS_FISCAIS
            ).count() * 100 if self.db.query(Document).filter(
                Document.category == DocumentCategory.NOTAS_FISCAIS
            ).count() > 0 else 0
        }