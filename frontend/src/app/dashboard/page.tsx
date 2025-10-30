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

interface NfeStats {
  total_nfe: number;
  total_value: number;
  average_value: number;
  processed_today: number;
}

interface CfopDistribution {
  cfop: string;
  count: number;
  percentage: number;
}

interface NcmTop {
  ncm: string;
  description: string;
  count: number;
}

export default function DashboardPage() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [documentsByCategory, setDocumentsByCategory] = useState<DocumentCategory[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [nfeStats, setNfeStats] = useState<NfeStats | null>(null);
  const [cfopDistribution, setCfopDistribution] = useState<CfopDistribution[]>([]);
  const [topNcms, setTopNcms] = useState<NcmTop[]>([]);
  const [loading, setLoading] = useState(true);

  const dashboardService = DashboardService();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [stats, chats, docs, act, nfeData, cfopData, ncmData] = await Promise.all([
        dashboardService.getSystemStats(),
        dashboardService.getRecentChats(5),
        dashboardService.getDocumentsByCategory(),
        dashboardService.getActivityByDay(7),
        dashboardService.getNfeStatistics(),
        dashboardService.getNfeCfopDistribution(),
        dashboardService.getNfeNcmTop(5)
      ]);

      setSystemStats(stats);
      setRecentChats(chats.recent_chats || []);
      setDocumentsByCategory(docs.documents_by_category || []);
      setActivity(act.activity || []);
      setNfeStats(nfeData);
      setCfopDistribution(cfopData.cfop_distribution || []);
      setTopNcms(ncmData.top_ncms || []);
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

  const formatCurrency = (value: number) => {
    const numValue = isNaN(value) ? 0 : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatNumber = (value: number) => {
    return isNaN(value) ? 0 : value;
  };

  const formatPercentage = (value: number) => {
    const numValue = isNaN(value) ? 0 : value;
    return numValue.toFixed(1);
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

          {/* Stats Cards Gerais */}
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="stat bg-primary text-primary-content rounded-box">
                <div className="stat-figure">
                  <div className="text-3xl">📚</div>
                </div>
                <div className="stat-title text-primary-content/70">Total de Documentos</div>
                <div className="stat-value">{formatNumber(systemStats.total_documents)}</div>
              </div>
              
              <div className="stat bg-secondary text-secondary-content rounded-box">
                <div className="stat-figure">
                  <div className="text-3xl">💬</div>
                </div>
                <div className="stat-title text-secondary-content/70">Total de Chats</div>
                <div className="stat-value">{formatNumber(systemStats.total_chats)}</div>
              </div>
              
              <div className="stat bg-accent text-accent-content rounded-box">
                <div className="stat-figure">
                  <div className="text-3xl">🎯</div>
                </div>
                <div className="stat-title text-accent-content/70">Total de Sessões</div>
                <div className="stat-value">{formatNumber(systemStats.total_sessions)}</div>
              </div>
            </div>
          )}

          {/* Stats NFE */}
          {nfeStats && (
            <div className="card bg-gradient-to-r from-info to-info-focus text-info-content shadow-xl mb-8">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🧾</div>
                  <h2 className="card-title text-2xl">Estatísticas de Notas Fiscais</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="stat bg-info-content text-info rounded-box">
                    <div className="stat-title text-info/70">Total NFe</div>
                    <div className="stat-value text-lg">{formatNumber(nfeStats.total_nfe)}</div>
                  </div>
                  
                  <div className="stat bg-info-content text-info rounded-box">
                    <div className="stat-title text-info/70">Valor Total</div>
                    <div className="stat-value text-sm">{formatCurrency(nfeStats.total_value)}</div>
                  </div>
                  
                  <div className="stat bg-info-content text-info rounded-box">
                    <div className="stat-title text-info/70">Valor Médio</div>
                    <div className="stat-value text-sm">{formatCurrency(nfeStats.average_value)}</div>
                  </div>
                  
                  <div className="stat bg-info-content text-info rounded-box">
                    <div className="stat-title text-info/70">Processadas Hoje</div>
                    <div className="stat-value text-lg">{formatNumber(nfeStats.processed_today)}</div>
                  </div>
                </div>
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
                              Sessão #{formatNumber(chat.session_id)}
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

            {/* Top CFOPs */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">📋</div>
                  <h2 className="card-title text-primary">Top CFOPs</h2>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : cfopDistribution.length > 0 ? (
                  <div className="space-y-3">
                    {cfopDistribution.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-base-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-secondary">{item.cfop}</span>
                        </div>
                        <div className="text-right">
                          <div className="badge badge-primary">{formatNumber(item.count)}</div>
                          <div className="text-xs text-base-content/60 mt-1">
                            {formatPercentage(item.percentage)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-base-content/70">Nenhum CFOP encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                        <span className="badge badge-primary">{formatNumber(item.count)}</span>
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

            {/* Top NCMs */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">🏷️</div>
                  <h2 className="card-title text-primary">Top NCMs</h2>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : topNcms.length > 0 ? (
                  <div className="space-y-3">
                    {topNcms.map((item, index) => (
                      <div key={index} className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="badge badge-secondary mb-1">{item.ncm}</div>
                              <p className="text-xs text-base-content/70 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <span className="badge badge-primary ml-2">{formatNumber(item.count)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🏷️</div>
                    <p className="text-base-content/70">Nenhum NCM encontrado</p>
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
                      <div className="stat-value text-lg">{formatNumber(item.chat_count)}</div>
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