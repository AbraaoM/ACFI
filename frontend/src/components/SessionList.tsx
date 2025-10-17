import { Session } from '@/models/session'

interface SessionListProps {
  sessions: Session[]
  activeSessionId: string
  onSessionSelect: (sessionId: string) => void
  children?: React.ReactNode
}

export default function SessionList({ 
  sessions, 
  activeSessionId, 
  onSessionSelect,
  children
}: SessionListProps) {
  return (
    <div className="w-80 bg-base-200 border-r border-base-300 flex flex-col">
      <div className="p-4 border-b border-base-300">
        {children}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {sessions.length === 0 ? (
            <div className="text-center text-base-content/50 p-4">
              Nenhuma conversa ainda
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`card bg-base-100 shadow-sm mb-2 cursor-pointer hover:bg-base-200 transition-colors ${
                  activeSessionId === session.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="card-body p-3">
                  <h3 className="card-title text-sm">{session.name}</h3>
                  <p className="text-xs text-base-content/70 truncate">{session.description}</p>
                  <div className="text-xs text-base-content/50 text-right">
                    {new Date(session.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}