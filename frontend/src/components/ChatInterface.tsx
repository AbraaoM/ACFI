"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatSession } from '@/models';

interface ChatInterfaceProps {
  session: ChatSession | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  onClearChat: () => void;
}

export default function ChatInterface({ 
  session, 
  messages, 
  onSendMessage, 
  isTyping, 
  onClearChat 
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 bg-base-100 rounded-2xl shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-base-content">
              {session ? session.title : 'Chat Rápido'}
            </h3>
            <p className="text-xs text-base-content/60">
              {session ? 'Sessão salva' : 'Conversa temporária'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="badge badge-sm badge-success">
            {messages.filter(m => m.role === 'user').length} mensagens
          </div>
          <button 
            className="btn btn-ghost btn-sm rounded-lg"
            onClick={onClearChat}
            title="Limpar chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {message.role === 'user' ? (
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="chat-header">
                {message.role === 'user' ? 'Você' : 'Assistente ACFI'}
                <time className="text-xs opacity-50 ml-2">
                  {message.created_at.toLocaleTimeString()}
                </time>
              </div>
              <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'} rounded-2xl max-w-xl`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              {message.metadata?.sources && (
                <div className="chat-footer">
                  <div className="mt-2 text-xs opacity-70">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-medium">Fontes:</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {message.metadata.sources.map((source, index) => (
                        <span key={index} className="badge badge-xs badge-outline">
                          {source}
                        </span>
                      ))}
                    </div>
                    {message.metadata.confidence && (
                      <div className="mt-1 text-xs opacity-50">
                        Confiança: {(message.metadata.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="chat-header">
                Assistente ACFI
                <span className="text-xs opacity-50 ml-2">digitando...</span>
              </div>
              <div className="chat-bubble chat-bubble-accent rounded-2xl">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-base-300">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              className="textarea textarea-bordered w-full rounded-2xl resize-none focus:border-primary"
              placeholder="Digite sua consulta sobre código tributário..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={inputMessage.split('\n').length}
              style={{ minHeight: '3rem', maxHeight: '8rem' }}
            />
          </div>
          <button
            className="btn btn-primary rounded-full px-6 flex-shrink-0"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
          >
            {isTyping ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-base-content/70">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="kbd kbd-xs">Enter</kbd>
              <span>enviar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="kbd kbd-xs">Shift</kbd>
              <span>+</span>
              <kbd className="kbd kbd-xs">Enter</kbd>
              <span>nova linha</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${isTyping ? 'bg-warning animate-pulse' : 'bg-success'}`}></span>
            <span>{isTyping ? 'Processando...' : 'Pronto'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}