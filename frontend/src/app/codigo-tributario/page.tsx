"use client";

import { useState } from 'react';
import { ChatMessage, ChatSession } from '@/models';
import ChatSessions from '@/components/ChatSessions';
import ChatInterface from '@/components/ChatInterface';
import SuggestionsSidebar from '@/components/SuggestionsSidebar';

export default function CodigoTributario() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      session_id: 'temp',
      role: 'assistant',
      content: 'Olá! Sou o assistente do Código Tributário. Posso ajudá-lo com consultas sobre legislação fiscal, impostos, tributos e regulamentações. Como posso ajudá-lo hoje?',
      created_at: new Date(),
      updated_at: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSessions, setShowSessions] = useState(true);

  const handleSendMessage = (inputMessage: string) => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      session_id: session?.id || 'temp',
      role: 'user',
      content: inputMessage,
      created_at: new Date(),
      updated_at: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    // Simular resposta do assistente (remover quando integrar com backend)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: session?.id || 'temp',
        role: 'assistant',
        content: 'Esta é uma resposta simulada. Quando integrado com o backend, aqui aparecerá a resposta real do sistema RAG com base no código tributário.',
        metadata: {
          sources: ['Lei 5.172/1966 - CTN', 'Decreto 70.235/1972'],
          confidence: 0.95,
          processing_time: 1.2,
        },
        created_at: new Date(),
        updated_at: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSessionSelect = (selectedSession: ChatSession) => {
    setSession(selectedSession);
    // Carregar mensagens da sessão (substituir por API call)
    setMessages([
      {
        id: '1',
        session_id: selectedSession.id,
        role: 'assistant',
        content: `Sessão "${selectedSession.title}" carregada. Como posso ajudá-lo?`,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  };

  const handleNewSession = () => {
    setSession(null);
    setMessages([
      {
        id: '1',
        session_id: 'temp',
        role: 'assistant',
        content: 'Olá! Sou o assistente do Código Tributário. Posso ajudá-lo com consultas sobre legislação fiscal, impostos, tributos e regulamentações. Como posso ajudá-lo hoje?',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (session?.id === sessionId) {
      handleNewSession();
    }
  };

  const handleClearChat = () => {
    if (session) {
      setMessages([
        {
          id: '1',
          session_id: session.id,
          role: 'assistant',
          content: `Sessão "${session.title}" limpa. Como posso ajudá-lo?`,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ]);
    } else {
      handleNewSession();
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <a href="/" className="btn btn-ghost text-xl">
            ← ACFI
          </a>
          <button 
            className="btn btn-ghost btn-sm ml-2"
            onClick={() => setShowSessions(!showSessions)}
            title={showSessions ? 'Ocultar sessões' : 'Mostrar sessões'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold text-primary">
            {session ? session.title : 'Código Tributário'}
          </h1>
        </div>
        <div className="navbar-end">
          <div className="flex items-center gap-2">
            <div className="badge badge-sm badge-outline">
              RAG System
            </div>
            <button 
              className="btn btn-primary btn-sm rounded-full"
              onClick={handleClearChat}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-4 h-[calc(100vh-80px)] flex gap-4">
        {/* Sessions Sidebar */}
        {showSessions && (
          <ChatSessions
            currentSession={session}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex gap-4">
          {/* Suggestions Sidebar - only show when no session is active */}
          {!session && (
            <SuggestionsSidebar onSuggestionClick={handleSendMessage} />
          )}

          {/* Chat Interface */}
          <ChatInterface
            session={session}
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            onClearChat={handleClearChat}
          />
        </div>
      </div>
    </div>
  );
}