'use client';

import { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import Menu from '@/components/Menu';

interface SystemStats {
  total_documents: number;
  total_chats: number;
  total_sessions: number;
}

interface RecentChat {
  id: number;
  question: string;
  created_at: string;
  session_id: number;
}

interface DocumentCategory {
  category: string;
  count: number;
}

interface Activity {
  date: string;
  chat_count: number;
}

export default function DashboardPage() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [documentsByCategory, setDocumentsByCategory] = useState<DocumentCategory[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const dashboardService = DashboardService();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [stats, chats, docs, act] = await Promise.all([
        dashboardService.getSystemStats(),
        dashboardService.getRecentChats(5),
        dashboardService.getDocumentsByCategory(),
        dashboardService.getActivityByDay(7)
      ]);

      setSystemStats(stats);
      setRecentChats(chats.recent_chats || []);
      setDocumentsByCategory(docs.documents_by_category || []);
      setActivity(act.activity || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'legislacao': '⚖️',
      'notas_fiscais': '🧾',
      'Sem categoria': '📄'
    };
    return icons[category as keyof typeof icons] || '📄';
  };

  return (
    <div className="flex h-screen bg-base-100">
      <Menu />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">📊 Dashboard</h1>
            <p className="text-base-content/70">Visão geral do sistema e estatísticas de uso</p>
          </div>

          {/* Stats Cards */}
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="stat bg-primary text-primary-content rounded-box">
                <div className="stat-figure">
                  <div className="text-3xl">📚</div>
                </div>
                <div className="stat-title text-primary-content/70">Total de Documentos</div>
                <div className="stat-value">{systemStats.total_documents}</div>
              </div>
              
              <div className="stat bg-secondary text-secondary-content rounded-box">
                <div className="stat-figure">
                  <div className="text-3xl">💬</div>
                </div>
                <div className="stat-title text-secondary-content/70">Total de Chats</div>
                <div className="stat-value">{systemStats.total_chats}</div>
              </div>
              
              <div className="stat bg-accent text-accent-content rounded-box">
                <div className="stat-figure">
                  <div className="text-3xl">🎯</div>
                </div>
                <div className="stat-title text-accent-content/70">Total de Sessões</div>
                <div className="stat-value">{systemStats.total_sessions}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chats Recentes */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">💭</div>
                  <h2 className="card-title text-primary">Chats Recentes</h2>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : recentChats.length > 0 ? (
                  <div className="space-y-3">
                    {recentChats.map((chat) => (
                      <div key={chat.id} className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                          <p className="text-sm text-base-content/80 line-clamp-2">
                            {chat.question}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="badge badge-outline badge-sm">
                              Sessão #{chat.session_id}
                            </span>
                            <span className="text-xs text-base-content/60">
                              {new Date(chat.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-base-content/70">Nenhum chat encontrado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documentos por Categoria */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">📁</div>
                  <h2 className="card-title text-primary">Documentos por Categoria</h2>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : documentsByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {documentsByCategory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-base-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(item.category)}</span>
                          <span className="text-sm font-medium">{item.category}</span>
                        </div>
                        <span className="badge badge-primary">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📂</div>
                    <p className="text-base-content/70">Nenhum documento encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Atividade por Dia */}
          {activity.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">📈</div>
                  <h2 className="card-title text-primary">Atividade dos Últimos 7 Dias</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {activity.map((item, index) => (
                    <div key={index} className="stat bg-base-200 rounded-box">
                      <div className="stat-title text-xs">
                        {new Date(item.date).toLocaleDateString('pt-BR', { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </div>
                      <div className="stat-value text-lg">{item.chat_count}</div>
                      <div className="stat-desc">chats</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botão para atualizar */}
          <div className="flex justify-center mt-8">
            <button 
              onClick={loadDashboardData}
              className={`btn btn-primary btn-lg ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Carregando...' : '🔄 Atualizar Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}