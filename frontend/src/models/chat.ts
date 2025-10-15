export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    sources?: string[];
    confidence?: number;
    processing_time?: number;
    [key: string]: any;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateChatMessageRequest {
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    sources?: string[];
    confidence?: number;
    processing_time?: number;
    [key: string]: any;
  };
}

export interface ChatMessageResponse {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    sources?: string[];
    confidence?: number;
    processing_time?: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

// Utility functions para conversão
export const convertChatMessageResponse = (response: ChatMessageResponse): ChatMessage => ({
  ...response,
  created_at: new Date(response.created_at),
  updated_at: new Date(response.updated_at),
});

export const convertChatMessageToRequest = (message: Partial<ChatMessage>): CreateChatMessageRequest => ({
  session_id: message.session_id!,
  role: message.role!,
  content: message.content!,
  metadata: message.metadata,
});