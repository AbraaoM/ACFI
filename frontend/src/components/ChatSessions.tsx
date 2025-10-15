"use client";

import { useState, useEffect } from 'react';
import { ChatSession } from '@/models';

interface ChatSessionsProps {
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function ChatSessions({ 
  currentSession, 
  onSessionSelect, 
  onNewSession, 
  onDeleteSession 
}: ChatSessionsProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Simular carregamento de sessões (substituir por API call)
    const mockSessions: ChatSession[] = [
      {
        id: '1',
        title: 'ICMS - Vendas Interestaduais',
        user_id: 'user1',
        created_at: new Date(Date.now() - 86400000), // 1 dia atrás
        updated_at: new Date(Date.now() - 3600000), // 1 hora atrás
      },
      {
        id: '2',
        title: 'Simples Nacional - Limites 2024',
        user_id: 'user1',
        created_at: new Date(Date.now() - 172800000), // 2 dias atrás
        updated_at: new Date(Date.now() - 7200000), // 2 horas atrás
      },
      {
        id: '3',
        title: 'IPI - Produtos Isentos',
        user_id: 'user1',
        created_at: new Date(Date.now() - 259200000), // 3 dias atrás
        updated_at: new Date(Date.now() - 10800000), // 3 horas atrás
      },
    ];
    setSessions(mockSessions);
  }, []);

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;

    setIsCreatingSession(true);
    
    // Simular criação de sessão (substituir por API call)
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: newSessionTitle,
      user_id: 'user1',
      created_at: new Date(),
      updated_at: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setNewSessionTitle('');
    setShowCreateModal(false);
    setIsCreatingSession(false);
    onSessionSelect(newSession);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    }
  };

  return (
    <div className="w-80 bg-base-100 rounded-2xl shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-base-content">Sessões de Chat</h2>
          <button 
            className="btn btn-primary btn-sm rounded-full"
            onClick={() => setShowCreateModal(true)}
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
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4">
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
        </div>
        
        {sessions.length === 0 && (
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
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost rounded-xl"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewSessionTitle('');
                }}
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
            onClick={() => setShowCreateModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
}