import { useState } from 'react'

interface NewSessionFormProps {
  onCreateSession: (name: string) => void
}

export default function NewSessionForm({ onCreateSession }: NewSessionFormProps) {
  const [showInput, setShowInput] = useState(false)
  const [sessionName, setSessionName] = useState('')

  const handleCreate = () => {
    if (!sessionName.trim()) return
    
    onCreateSession(sessionName.trim())
    setSessionName('')
    setShowInput(false)
  }

  const handleCancel = () => {
    setSessionName('')
    setShowInput(false)
  }

  if (!showInput) {
    return (
      <button 
        onClick={() => setShowInput(true)}
        className="btn btn-primary btn-block"
      >
        + Nova Conversa
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleCreate()
          if (e.key === 'Escape') handleCancel()
        }}
        placeholder="Nome da conversa..."
        className="input input-bordered input-sm w-full"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          className="btn btn-primary btn-sm flex-1"
          disabled={!sessionName.trim()}
        >
          Criar
        </button>
        <button
          onClick={handleCancel}
          className="btn btn-ghost btn-sm flex-1"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}