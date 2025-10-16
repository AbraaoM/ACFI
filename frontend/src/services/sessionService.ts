const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export function SessionService() {
  const createSession = async (name: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return response.json();
  };

  const getSessions = async () => {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    return response.json();
  };

  const getSession = async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
    return response.json();
  };

  const updateSession = async (sessionId: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return response.json();
  };

  const deleteSession = async (sessionId: string) => {
    await fetch(`${API_BASE_URL}/sessions/${sessionId}`, { method: 'DELETE' });
  };

  return { createSession, getSessions, getSession, updateSession, deleteSession };
}