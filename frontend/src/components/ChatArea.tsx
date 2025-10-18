'use client'

import { useState, useEffect, useRef } from 'react'
import { Chat } from '@/models/chat'
import { ChatService } from '@/services/chatService'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

interface ChatAreaProps {
  sessionId: string
  sessionName: string
  onMessagesUpdate?: (messages: Message[]) => void
  disabled?: boolean
}

export default function ChatArea({ sessionId, sessionName, onMessagesUpdate, disabled }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const chatService = ChatService()

  // Carregar mensagens quando a sessão muda
  useEffect(() => {
    if (sessionId) {
      loadMessages()
    }
  }, [sessionId])

  // Auto-scroll para o fim das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    if (!sessionId) return
    
    try {
      setLoadingMessages(true)
      const chats = await chatService.getChatsBySession(sessionId)
      
      const formattedMessages: Message[] = chats.map((chat: Chat) => ({
        id: chat.id,
        content: chat.content,
        isUser: chat.role === 'user',
        timestamp: new Date(chat.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }))
      
      setMessages(formattedMessages)
      onMessagesUpdate?.(formattedMessages)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      // Mensagem de boas-vindas como fallback
      const welcomeMessage: Message = {
        id: '1',
        content: 'Olá! Como posso ajudar com questões tributárias?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages([welcomeMessage])
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || disabled || !sessionId || loading) return
    
    try {
      setLoading(true)
      
      // Adiciona mensagem do usuário imediatamente
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        content: newMessage,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages(prev => [...prev, userMessage])
      setNewMessage('')
      
      // Envia pergunta para o backend
      const response = await chatService.createChat({
        session_id: sessionId,
        question: newMessage
      })
      
      // Recarrega todas as mensagens para garantir sincronização
      await loadMessages()
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Remove a mensagem temporária em caso de erro
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`))
      
      // Adiciona mensagem de erro
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
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
        {loadingMessages ? (
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <>
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
            {loading && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                    AI
                  </div>
                </div>
                <div className="chat-header">
                  Assistente
                </div>
                <div className="chat-bubble chat-bubble-secondary">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
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
            disabled={disabled || loading || !sessionId}
          />
          <button
            onClick={handleSendMessage}
            className="btn btn-primary"
            disabled={!newMessage.trim() || disabled || loading || !sessionId}
          >
            {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}