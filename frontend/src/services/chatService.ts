import { apiRequest } from './api';
import {
  ChatMessage,
  ChatMessageResponse,
  CreateChatMessageRequest,
  convertChatMessageResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/models';

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
}