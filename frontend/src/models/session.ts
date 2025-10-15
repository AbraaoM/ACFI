export interface ChatSession {
  id: string;
  title?: string;
  user_id?: string;
  created_at: Date;
  updated_at: Date;
  last_activity?: Date;
  metadata?: {
    message_count?: number;
    total_tokens?: number;
    [key: string]: any;
  };
}

export interface CreateSessionRequest {
  title?: string;
  user_id?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface UpdateSessionRequest {
  title?: string;
  metadata?: {
    message_count?: number;
    total_tokens?: number;
    [key: string]: any;
  };
}

export interface SessionResponse {
  id: string;
  title?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  last_activity?: string;
  metadata?: {
    message_count?: number;
    total_tokens?: number;
    [key: string]: any;
  };
}

// Utility functions para conversão
export const convertSessionResponse = (response: SessionResponse): ChatSession => ({
  ...response,
  created_at: new Date(response.created_at),
  updated_at: new Date(response.updated_at),
  last_activity: response.last_activity ? new Date(response.last_activity) : undefined,
});

export const convertSessionToCreateRequest = (session: Partial<ChatSession>): CreateSessionRequest => ({
  title: session.title,
  user_id: session.user_id,
  metadata: session.metadata,
});

export const convertSessionToUpdateRequest = (session: Partial<ChatSession>): UpdateSessionRequest => ({
  title: session.title,
  metadata: session.metadata,
});