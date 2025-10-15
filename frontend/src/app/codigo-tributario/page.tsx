"use client";

import { useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export default function CodigoTributario() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou o assistente do Código Tributário. Posso ajudá-lo com consultas sobre legislação fiscal, impostos, tributos e regulamentações. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular resposta do assistente (remover quando integrar com backend)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Esta é uma resposta simulada. Quando integrado com o backend, aqui aparecerá a resposta real do sistema RAG com base no código tributário.',
        timestamp: new Date(),
        sources: ['Lei 5.172/1966 - CTN', 'Decreto 70.235/1972']
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold text-primary">Código Tributário</h1>
        </div>
        <div className="navbar-end">
          <button className="btn btn-primary btn-sm rounded-full">
            Limpar Chat
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl p-4 h-[calc(100vh-80px)] flex gap-4">
        {/* Sidebar com sugestões */}
        <div className="w-80 bg-base-100 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-base-content">Sugestões de Consulta</h2>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors">
              <div className="font-medium text-sm">ICMS</div>
              <div className="text-xs text-base-content/70">Como calcular ICMS sobre vendas interestaduais?</div>
            </button>
            
            <button className="w-full text-left p-3 bg-success/5 hover:bg-success/10 rounded-xl transition-colors">
              <div className="font-medium text-sm">IPI</div>
              <div className="text-xs text-base-content/70">Quais produtos são isentos de IPI?</div>
            </button>
            
            <button className="w-full text-left p-3 bg-accent/5 hover:bg-accent/10 rounded-xl transition-colors">
              <div className="font-medium text-sm">Simples Nacional</div>
              <div className="text-xs text-base-content/70">Limites de faturamento para 2024</div>
            </button>
            
            <button className="w-full text-left p-3 bg-info/5 hover:bg-info/10 rounded-xl transition-colors">
              <div className="font-medium text-sm">IRPF</div>
              <div className="text-xs text-base-content/70">Deduções permitidas na declaração</div>
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-md font-semibold mb-3 text-base-content">Recursos</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Citações legais precisas
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Base legal atualizada
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Respostas contextualizadas
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-base-100 rounded-2xl shadow-xl flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {message.type === 'user' ? (
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
                    {message.type === 'user' ? 'Você' : 'Assistente ACFI'}
                    <time className="text-xs opacity-50 ml-2">
                      {message.timestamp.toLocaleTimeString()}
                    </time>
                  </div>
                  <div className={`chat-bubble ${message.type === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'} rounded-2xl`}>
                    {message.content}
                  </div>
                  {message.sources && (
                    <div className="chat-footer">
                      <div className="mt-2 text-xs opacity-70">
                        <span className="font-medium">Fontes: </span>
                        {message.sources.join(', ')}
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
                  <div className="chat-bubble chat-bubble-accent rounded-2xl">
                    <span className="loading loading-dots loading-sm"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-base-300">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  className="textarea textarea-bordered w-full rounded-2xl resize-none"
                  placeholder="Digite sua consulta sobre código tributário..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows={2}
                />
              </div>
              <button
                className="btn btn-primary rounded-full px-6"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-base-content/70">
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
          </div>
        </div>
      </div>
    </div>
  );
}