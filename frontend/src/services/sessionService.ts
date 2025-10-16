const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SessionResponse {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionRequest {
  title: string;
  user_id: string;
}

export interface UpdateSessionRequest {
  title?: string;
}

export interface PaginatedSessionResponse {
  data: SessionResponse[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// Converter response do backend para o formato do frontend
function convertSession(session: SessionResponse) {
  return {
    id: session.id,
    title: session.title,
    user_id: session.user_id,
    created_at: new Date(session.created_at),
    updated_at: new Date(session.updated_at),
  };
}

export const SessionService = {
  async getSessions(page = 1, perPage = 20, userId?: string) {
    let url = `${API_BASE_URL}/api/sessions?page=${page}&per_page=${perPage}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar sessões: ${response.status}`);
    }

    const data: PaginatedSessionResponse = await response.json();
    
    return {
      ...data,
      data: data.data.map(convertSession),
    };
  },

  async createSession(session: CreateSessionRequest) {
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar sessão: ${response.status}`);
    }

    const data: { data: SessionResponse } = await response.json();
    return convertSession(data.data);
  },

  async getSession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar sessão: ${response.status}`);
    }

    const data: { data: SessionResponse } = await response.json();
    return convertSession(data.data);
  },

  async updateSession(sessionId: string, updates: UpdateSessionRequest) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar sessão: ${response.status}`);
    }

    const data: { data: SessionResponse } = await response.json();
    return convertSession(data.data);
  },

  async deleteSession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar sessão: ${response.status}`);
    }
  },
};