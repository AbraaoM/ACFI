'use client'

import { useState } from 'react'

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

export default function CodigoTributarioPage() {
  const [sessions] = useState<ChatSession[]>([
    { id: '1', title: 'Consulta ICMS', lastMessage: 'Como calcular ICMS?', timestamp: '10:30' },
    { id: '2', title: 'ISS Municipal', lastMessage: 'Alíquota do ISS...', timestamp: '09:15' },
    { id: '3', title: 'PIS/COFINS', lastMessage: 'Regime de apuração', timestamp: 'Ontem' }
  ])
  
  const [activeSession, setActiveSession] = useState<string>('1')
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Olá! Como posso ajudar com questões tributárias?', isUser: false, timestamp: '10:30' },
    { id: '2', content: 'Como calcular ICMS?', isUser: true, timestamp: '10:31' },
    { id: '3', content: 'O ICMS é calculado sobre o valor da operação...', isUser: false, timestamp: '10:32' }
  ])
  
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    
    // Simular resposta do sistema
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Esta é uma resposta simulada do sistema.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMessage])
    }, 1000)
  }

  const handleNewChat = () => {
    const newSessionId = Date.now().toString()
    setActiveSession(newSessionId)
    setMessages([
      { id: '1', content: 'Olá! Como posso ajudar com questões tributárias?', isUser: false, timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    ])
  }

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar - Gerenciador de Sessões */}
      <div className="w-80 bg-base-200 border-r border-base-300 flex flex-col">
        <div className="p-4 border-b border-base-300">
          <button 
            onClick={handleNewChat}
            className="btn btn-primary btn-block"
          >
            + Nova Conversa
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`card bg-base-100 shadow-sm mb-2 cursor-pointer hover:bg-base-200 transition-colors ${
                  activeSession === session.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveSession(session.id)}
              >
                <div className="card-body p-3">
                  <h3 className="card-title text-sm">{session.title}</h3>
                  <p className="text-xs text-base-content/70 truncate">{session.lastMessage}</p>
                  <div className="text-xs text-base-content/50 text-right">{session.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Área do Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header do Chat */}
        <div className="bg-base-200 p-4 border-b border-base-300">
          <h1 className="text-xl font-bold">Código Tributário - Chat</h1>
          <p className="text-sm text-base-content/70">Assistente para questões tributárias</p>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat ${message.isUser ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                  {message.isUser ? 'U' : 'AI'}
                </div>
              </div>
              <div className="chat-header">
                {message.isUser ? 'Você' : 'Assistente'}
                <time className="text-xs opacity-50 ml-1">{message.timestamp}</time>
              </div>
              <div className={`chat-bubble ${message.isUser ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input de Mensagem */}
        <div className="bg-base-200 p-4 border-t border-base-300">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua pergunta sobre tributação..."
              className="input input-bordered flex-1"
            />
            <button
              onClick={handleSendMessage}
              className="btn btn-primary"
              disabled={!newMessage.trim()}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}