'use client';

import { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Estatísticas Gerais */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total de Documentos</h3>
            <p className="text-3xl font-bold text-blue-600">{systemStats.total_documents}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total de Chats</h3>
            <p className="text-3xl font-bold text-green-600">{systemStats.total_chats}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total de Sessões</h3>
            <p className="text-3xl font-bold text-purple-600">{systemStats.total_sessions}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chats Recentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Chats Recentes</h2>
          <div className="space-y-3">
            {recentChats.length > 0 ? (
              recentChats.map((chat) => (
                <div key={chat.id} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600 truncate">{chat.question}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(chat.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Nenhum chat encontrado</p>
            )}
          </div>
        </div>

        {/* Documentos por Categoria */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Documentos por Categoria</h2>
          <div className="space-y-3">
            {documentsByCategory.length > 0 ? (
              documentsByCategory.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Nenhum documento encontrado</p>
            )}
          </div>
        </div>
      </div>

      {/* Atividade por Dia */}
      {activity.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Atividade dos Últimos 7 Dias</h2>
          <div className="space-y-2">
            {activity.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-sm font-medium">{item.chat_count} chats</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}