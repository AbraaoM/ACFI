import { apiRequest } from './api';
import {
  ChatMessage,
  ChatMessageResponse,
  CreateChatMessageRequest,
  convertChatMessageResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/models';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface MessageResponse {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    sources?: string[];
    confidence?: number;
    processing_time?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  session_id: string;
  content: string;
}

export interface PaginatedMessageResponse {
  data: MessageResponse[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// Converter response do backend para o formato do frontend
function convertMessage(message: MessageResponse) {
  return {
    id: message.id,
    session_id: message.session_id,
    role: message.role,
    content: message.content,
    metadata: message.metadata,
    created_at: new Date(message.created_at),
    updated_at: new Date(message.updated_at),
  };
}

export class ChatService {
  private static baseUrl = '/api/chat';

  // GET /api/chat/messages?session_id={session_id}&page={page}&per_page={per_page}
  static async getMessages(
    sessionId: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<ChatMessage>> {
    const response = await apiRequest<PaginatedResponse<ChatMessageResponse>>(
      `${this.baseUrl}/messages?session_id=${sessionId}&page=${page}&per_page=${perPage}`
    );

    return {
      ...response,
      data: response.data.map(convertChatMessageResponse),
    };
  }

  // POST /api/chat/messages
  static async createMessage(message: CreateChatMessageRequest): Promise<ChatMessage> {
    const response = await apiRequest<ApiResponse<ChatMessageResponse>>(
      `${this.baseUrl}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(message),
      }
    );

    return convertChatMessageResponse(response.data);
  }

  // GET /api/chat/messages/{message_id}
  static async getMessage(messageId: string): Promise<ChatMessage> {
    const response = await apiRequest<ApiResponse<ChatMessageResponse>>(
      `${this.baseUrl}/messages/${messageId}`
    );

    return convertChatMessageResponse(response.data);
  }

  // PUT /api/chat/messages/{message_id}
  static async updateMessage(
    messageId: string,
    updates: Partial<CreateChatMessageRequest>
  ): Promise<ChatMessage> {
    const response = await apiRequest<ApiResponse<ChatMessageResponse>>(
      `${this.baseUrl}/messages/${messageId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );

    return convertChatMessageResponse(response.data);
  }

  // DELETE /api/chat/messages/{message_id}
  static async deleteMessage(messageId: string): Promise<void> {
    await apiRequest<ApiResponse<null>>(
      `${this.baseUrl}/messages/${messageId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // POST /api/chat/query - Endpoint principal para chat RAG
  static async sendQuery(
    sessionId: string,
    query: string
  ): Promise<ChatMessage> {
    const response = await apiRequest<ApiResponse<ChatMessageResponse>>(
      `${this.baseUrl}/query`,
      {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          query,
        }),
      }
    );

    return convertChatMessageResponse(response.data);
  }

  async sendMessage(sessionId: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${response.status}`);
    }

    const data: { data: MessageResponse } = await response.json();
    return convertMessage(data.data);
  }

  async getMessages(sessionId: string, page = 1, perPage = 50) {
    const response = await fetch(
      `${API_BASE_URL}/api/sessions/${sessionId}/messages?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar mensagens: ${response.status}`);
    }

    const data: PaginatedMessageResponse = await response.json();
    
    return {
      ...data,
      data: data.data.map(convertMessage),
    };
  }

  async deleteMessage(messageId: string) {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar mensagem: ${response.status}`);
    }
  }
}