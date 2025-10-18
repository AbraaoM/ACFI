'use client'

import { Session } from '@/models/session'
import { SessionService } from '@/services/sessionService'
import SessionList from '@/components/SessionList'
import NewSessionForm from '@/components/NewSessionForm'
import ChatArea from '@/components/ChatArea'
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

  const handleSendMessage = async (messageContent: string) => {
    if (!activeSession) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, userMessage])
    
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
      const newSession = await sessionService.createSession({name: sessionName, description: 'Conversa iniciada'} as Session)
      
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

  const activeSessionName = sessions.find(s => s.id === activeSession)?.name || ''

  return (
    <div className="flex h-screen bg-base-100">
      <SessionList
        sessions={sessions}
        activeSessionId={activeSession}
        onSessionSelect={handleSessionSelect}
      >
        <NewSessionForm onCreateSession={handleNewChat} />
      </SessionList>

      <ChatArea
        sessionName={activeSessionName}
        messages={messages}
        onSendMessage={handleSendMessage}
        disabled={!activeSession}
      />
    </div>
  )
}