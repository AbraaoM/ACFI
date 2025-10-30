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

// Componente para formatar mensagens da IA
function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <span>{content}</span>
  }

  // Formatação para mensagens da IA
  const formatAIResponse = (text: string) => {
    // Substituir quebras de linha por <br>
    let formatted = text.replace(/\n/g, '<br>')
    
    // Formatação para texto em negrito (**texto**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    
    // Formatação para texto em itálico (*texto*)
    formatted = formatted.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em class="text-white">$1</em>')
    
    // Formatação para código inline (`código`)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-base-content/20 px-1 rounded text-sm text-white">$1</code>')
    
    // Formatação para listas numeradas
    formatted = formatted.replace(/^\d+\.\s+(.+)/gm, '<div class="ml-4 mb-1"><span class="font-semibold text-white">•</span> <span class="text-white">$1</span></div>')
    
    // Formatação para listas com hífen
    formatted = formatted.replace(/^-\s+(.+)/gm, '<div class="ml-4 mb-1"><span class="font-semibold text-white">•</span> <span class="text-white">$1</span></div>')
    
    // Formatação para títulos (## Título)
    formatted = formatted.replace(/^##\s+(.+)/gm, '<h3 class="text-lg font-bold mt-3 mb-2 text-white">$1</h3>')
    
    // Formatação para subtítulos (### Subtítulo)
    formatted = formatted.replace(/^###\s+(.+)/gm, '<h4 class="text-md font-semibold mt-2 mb-1 text-white">$1</h4>')
    
    // Formatação para blocos de código (```código```)
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-base-content/20 p-3 rounded-lg mt-2 mb-2 overflow-x-auto text-white"><code class="text-white">$1</code></pre>')
    
    // Formatação para links [texto](url)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-200 underline hover:text-blue-100" target="_blank" rel="noopener noreferrer">$1</a>')
    
    return formatted
  }

  return (
    <div 
      className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1"
      dangerouslySetInnerHTML={{ __html: formatAIResponse(content) }}
    />
  )
}

// Componente para exibir mensagens com animação de digitação
function TypingMessage({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 20) // Velocidade da animação

      return () => clearTimeout(timer)
    }
  }, [currentIndex, content])

  return <FormattedMessage content={displayedContent} isUser={false} />
}

export default function ChatArea({ sessionId, sessionName, onMessagesUpdate, disabled }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
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
        content: '## Bem-vindo ao Assistente Tributário! 🏛️\n\nOlá! Sou seu assistente especializado em **questões tributárias**. Posso ajudar com:\n\n- Cálculo de impostos\n- Interpretação de códigos fiscais\n- Orientações sobre obrigações tributárias\n- Esclarecimentos sobre legislação\n\n*Como posso ajudá-lo hoje?*',
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
        id: `user-${Date.now()}`,
        content: newMessage,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      
      const userMessageText = newMessage
      setMessages(prev => [...prev, userMessage])
      setNewMessage('')
      
      // Envia pergunta para o backend
      const response = await chatService.createChat({
        session_id: sessionId,
        question: userMessageText
      })
      
      // Adiciona resposta da IA com animação
      const aiMessageId = `ai-${Date.now()}`
      const aiMessage: Message = {
        id: aiMessageId,
        content: response.answer || 'Desculpe, não consegui processar sua pergunta.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages(prev => [...prev, aiMessage])
      setTypingMessageId(aiMessageId)
      
      // Remove a animação após um tempo
      setTimeout(() => {
        setTypingMessageId(null)
      }, aiMessage.content.length * 20 + 1000)
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Adiciona mensagem de erro
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: '⚠️ **Erro de Conexão**\n\nDesculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes.',
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
        <h1 className="text-xl font-bold flex items-center gap-2">
          💬 Código Tributário - Chat
        </h1>
        <p className="text-sm text-base-content/70">
          {sessionName || 'Assistente para questões tributárias'}
        </p>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-base-100 to-base-50">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-center">
              <span className="loading loading-spinner loading-md"></span>
              <p className="text-sm text-base-content/70 mt-2">Carregando mensagens...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat ${message.isUser ? 'chat-end' : 'chat-start'}`}
              >
                <div className="chat-image avatar">
                  <div className={`w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    message.isUser 
                      ? 'bg-primary text-primary-content' 
                      : 'bg-secondary text-secondary-content'
                  }`}>
                    {message.isUser ? '👤' : '🤖'}
                  </div>
                </div>
                <div className="chat-header">
                  {message.isUser ? 'Você' : 'Assistente Tributário'}
                  <time className="text-xs opacity-50 ml-1">{message.timestamp}</time>
                </div>
                <div className={`chat-bubble ${
                  message.isUser 
                    ? 'chat-bubble-primary' 
                    : 'chat-bubble-secondary'
                } max-w-4xl`}>
                  {message.isUser ? (
                    <span>{message.content}</span>
                  ) : typingMessageId === message.id ? (
                    <TypingMessage content={message.content} />
                  ) : (
                    <FormattedMessage content={message.content} isUser={false} />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                    🤖
                  </div>
                </div>
                <div className="chat-header">
                  Assistente Tributário
                </div>
                <div className="chat-bubble chat-bubble-secondary">
                  <div className="flex items-center gap-2">
                    <span className="loading loading-dots loading-sm"></span>
                    <span className="text-xs">Processando sua pergunta...</span>
                  </div>
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
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Digite sua pergunta sobre tributação... (Enter para enviar, Shift+Enter para nova linha)"
            className="textarea textarea-bordered flex-1 resize-none"
            rows={2}
            disabled={disabled || loading || !sessionId}
          />
          <button
            onClick={handleSendMessage}
            className="btn btn-primary self-end"
            disabled={!newMessage.trim() || disabled || loading || !sessionId}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <span>📤</span>
                Enviar
              </>
            )}
          </button>
        </div>
        <div className="text-xs text-base-content/50 mt-1">
          💡 Dica: Use **negrito**, *itálico*, `código` ou ## Títulos para formatar suas perguntas
        </div>
      </div>
    </div>
  )
}