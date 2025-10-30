'use client'

import { Session } from '@/models/session'
import { SessionService } from '@/services/sessionService'
import SessionList from '@/components/SessionList'
import NewSessionForm from '@/components/NewSessionForm'
import ChatArea from '@/components/ChatArea'
import Menu from '@/components/Menu'
import { useState, useEffect } from 'react'

export default function CodigoTributarioPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<string>('')
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
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
      // Fallback com dados mockados
      const mockSessions: Session[] = [
        { id: '1', name: 'Consulta ICMS', description: 'Como calcular ICMS?', createdAt: new Date(), updatedAt: new Date() }
      ]
      setSessions(mockSessions)
      setActiveSession('1')
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = async (sessionName: string) => {
    try {
      const newSession = await sessionService.createSession({
        name: sessionName, 
        description: 'Conversa iniciada'
      } as Session)
      
      // Atualiza a lista de sessões
      setSessions(prev => [newSession, ...prev])
      setActiveSession(newSession.id)
      
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
    }
  }

  const handleSessionSelect = (sessionId: string) => {
    setActiveSession(sessionId)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-base-100">
        <Menu />
        <div className="flex-1 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  const activeSessionData = sessions.find(s => s.id === activeSession)

  return (
    <div className="flex h-screen bg-base-100">
      <Menu />
      
      <SessionList
        sessions={sessions}
        activeSessionId={activeSession}
        onSessionSelect={handleSessionSelect}
      >
        <NewSessionForm onCreateSession={handleNewChat} />
      </SessionList>

      {activeSession ? (
        <ChatArea
          sessionId={activeSession}
          sessionName={activeSessionData?.name || ''}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Bem-vindo ao Chat Tributário</h2>
            <p className="text-base-content/70">Selecione uma sessão ou crie uma nova para começar</p>
          </div>
        </div>
      )}
    </div>
  )
}