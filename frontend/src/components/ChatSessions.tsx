"use client";

import { useState, useEffect } from 'react';
import { SessionService } from '@/services/sessionService';

interface ChatSession {
  id: string;
  title: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

interface ChatSessionsProps {
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  userId?: string;
}

export default function ChatSessions({ 
  currentSession, 
  onSessionSelect, 
  onNewSession, 
  onDeleteSession,
  userId = 'user1'
}: ChatSessionsProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadSessions = async (pageNum = 1, append = false) => {
    try {
      setError(null);
      if (!append) setIsLoading(true);

      const response = await SessionService.getSessions(pageNum, 20, userId);
      
      if (append) {
        setSessions(prev => [...prev, ...response.data]);
      } else {
        setSessions(response.data);
      }
      
      setHasMore(response.page < response.total_pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      setError('Erro ao carregar sessões. Tente novamente.');
      
      // Fallback para dados mockados
      if (!append && sessions.length === 0) {
        const mockSessions: ChatSession[] = [
          {
            id: '1',
            title: 'ICMS - Vendas Interestaduais',
            user_id: userId,
            created_at: new Date(Date.now() - 86400000),
            updated_at: new Date(Date.now() - 3600000),
          },
          {
            id: '2',
            title: 'Simples Nacional - Limites 2024',
            user_id: userId,
            created_at: new Date(Date.now() - 172800000),
            updated_at: new Date(Date.now() - 7200000),
          },
        ];
        setSessions(mockSessions);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;

    setIsCreatingSession(true);
    setError(null);
    
    try {
      const newSession = await SessionService.createSession({
        title: newSessionTitle,
        user_id: userId,
      });

      setSessions(prev => [newSession, ...prev]);
      setNewSessionTitle('');
      setShowCreateModal(false);
      onSessionSelect(newSession);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      setError('Erro ao criar sessão. Tente novamente.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await SessionService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      onDeleteSession(sessionId);
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      setError('Erro ao deletar sessão. Tente novamente.');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadSessions(page + 1, true);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadSessions(1, false);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <div className="w-80 bg-base-100 rounded-2xl shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-base-content">Sessões de Chat</h2>
            <button 
              className="btn btn-ghost btn-xs rounded-full"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Atualizar sessões"
            >
              <svg className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <button 
            className="btn btn-primary btn-sm rounded-full"
            onClick={() => setShowCreateModal(true)}
            disabled={isCreatingSession}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova
          </button>
        </div>
        
        <button 
          className="btn btn-outline btn-sm w-full rounded-xl"
          onClick={onNewSession}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat Rápido
        </button>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error alert-sm mt-3 rounded-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs">{error}</span>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && sessions.length === 0 ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="p-3 rounded-xl bg-base-200">
                  <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-base-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-xl cursor-pointer transition-all group hover:bg-base-200 ${
                  currentSession?.id === session.id ? 'bg-primary/10 border border-primary/20' : ''
                }`}
                onClick={() => onSessionSelect(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-base-content truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-base-content/60 mt-1">
                      {formatRelativeTime(session.updated_at)}
                    </p>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs text-error hover:bg-error/10"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <button
                className="w-full btn btn-ghost btn-sm rounded-xl"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Carregar mais'
                )}
              </button>
            )}
          </div>
        )}
        
        {!isLoading && sessions.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-base-content/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-base-content/60">Nenhuma sessão encontrada</p>
            <p className="text-xs text-base-content/40 mt-1">Crie uma nova sessão para começar</p>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl">
            <h3 className="font-bold text-lg mb-4">Nova Sessão de Chat</h3>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Título da sessão</span>
              </label>
              <input
                type="text"
                className="input input-bordered rounded-xl"
                placeholder="Ex: ICMS - Vendas Interestaduais"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                autoFocus
              />
              <label className="label">
                <span className="label-text-alt">Digite um título descritivo para a sessão</span>
              </label>
            </div>

            {error && (
              <div className="alert alert-error alert-sm mb-4 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-xs">{error}</span>
              </div>
            )}

            <div className="modal-action">
              <button 
                className="btn btn-ghost rounded-xl"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewSessionTitle('');
                  setError(null);
                }}
                disabled={isCreatingSession}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary rounded-xl"
                onClick={handleCreateSession}
                disabled={!newSessionTitle.trim() || isCreatingSession}
              >
                {isCreatingSession ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Criar Sessão'
                )}
              </button>
            </div>
          </div>
          <div 
            className="modal-backdrop" 
            onClick={() => {
              if (!isCreatingSession) {
                setShowCreateModal(false);
                setNewSessionTitle('');
                setError(null);
              }
            }}
          ></div>
        </div>
      )}
    </div>
  );
}