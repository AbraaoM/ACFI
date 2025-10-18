'use client'

import { useState } from 'react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

interface ChatAreaProps {
  sessionName: string
  messages: Message[]
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export default function ChatArea({ sessionName, messages, onSendMessage, disabled }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (!newMessage.trim() || disabled) return
    
    onSendMessage(newMessage)
    setNewMessage('')
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header do Chat */}
      <div className="bg-base-200 p-4 border-b border-base-300">
        <h1 className="text-xl font-bold">Código Tributário - Chat</h1>
        <p className="text-sm text-base-content/70">
          {sessionName || 'Assistente para questões tributárias'}
        </p>
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
            disabled={disabled}
          />
          <button
            onClick={handleSendMessage}
            className="btn btn-primary"
            disabled={!newMessage.trim() || disabled}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}