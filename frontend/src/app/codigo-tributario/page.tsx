'use client'

import { Session } from '@/models/session'
import { SessionService } from '@/services/sessionService'
import SessionList from '@/components/SessionList'
import NewSessionForm from '@/components/NewSessionForm'
import { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

export default function CodigoTributarioPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const sessionService = SessionService()

  // Carregar sessões na inicialização
  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const sessionsData = await sessionService.getSessions()
      setSessions(sessionsData)
      
      // Se há sessões, seleciona a primeira
      if (sessionsData.length > 0) {
        setActiveSession(sessionsData[0].id)
        loadSessionMessages(sessionsData[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
      // Fallback com dados mockados
      const mockSessions: Session[] = [
        { id: '1', name: 'Consulta ICMS', description: 'Como calcular ICMS?', createdAt: new Date(), updatedAt: new Date() }
      ]
      setSessions(mockSessions)
      setActiveSession('1')
      setMessages([
        { id: '1', content: 'Olá! Como posso ajudar com questões tributárias?', isUser: false, timestamp: '10:30' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadSessionMessages = (sessionId: string) => {
    // Por enquanto, carrega mensagens mockadas
    // No futuro, você pode criar um MessageService para buscar mensagens reais
    const mockMessages: Message[] = [
      { id: '1', content: 'Olá! Como posso ajudar com questões tributárias?', isUser: false, timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    ]
    setMessages(mockMessages)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return
    
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

  const handleNewChat = async (sessionName: string) => {
    try {
      const newSession = await sessionService.createSession(
        sessionName,
        'Conversa iniciada'
      )
      
      // Atualiza a lista de sessões
      setSessions(prev => [newSession, ...prev])
      setActiveSession(newSession.id)
      
      // Inicia com mensagem de boas-vindas
      setMessages([
        { 
          id: '1', 
          content: 'Olá! Como posso ajudar com questões tributárias?', 
          isUser: false, 
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
        }
      ])
    } catch (error) {
      console.error('Erro ao criar nova sessão:', error)
      // Fallback com dados mockados
      const newSessionId = Date.now().toString()
      const mockSession: Session = {
        id: newSessionId,
        name: sessionName,
        description: 'Conversa iniciada',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setSessions(prev => [mockSession, ...prev])
      setActiveSession(newSessionId)
      setMessages([
        { 
          id: '1', 
          content: 'Olá! Como posso ajudar com questões tributárias?', 
          isUser: false, 
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
        }
      ])
    }
  }

  const handleSessionSelect = (sessionId: string) => {
    setActiveSession(sessionId)
    loadSessionMessages(sessionId)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-base-100 items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-base-100">
      <SessionList
        sessions={sessions}
        activeSessionId={activeSession}
        onSessionSelect={handleSessionSelect}
      >
        <NewSessionForm onCreateSession={handleNewChat} />
      </SessionList>

      {/* Área do Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header do Chat */}
        <div className="bg-base-200 p-4 border-b border-base-300">
          <h1 className="text-xl font-bold">Código Tributário - Chat</h1>
          <p className="text-sm text-base-content/70">
            {sessions.find(s => s.id === activeSession)?.name || 'Assistente para questões tributárias'}
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
              disabled={!activeSession}
            />
            <button
              onClick={handleSendMessage}
              className="btn btn-primary"
              disabled={!newMessage.trim() || !activeSession}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}