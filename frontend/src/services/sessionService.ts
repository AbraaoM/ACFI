import { apiRequest } from './api';
import {
  ChatSession,
  SessionResponse,
  CreateSessionRequest,
  UpdateSessionRequest,
  convertSessionResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/models';

export class SessionService {
  private static baseUrl = '/api/sessions';

  // GET /api/sessions?page={page}&per_page={per_page}&user_id={user_id}
  static async getSessions(
    page: number = 1,
    perPage: number = 20,
    userId?: string
  ): Promise<PaginatedResponse<ChatSession>> {
    let url = `${this.baseUrl}?page=${page}&per_page=${perPage}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }

    const response = await apiRequest<PaginatedResponse<SessionResponse>>(url);

    return {
      ...response,
      data: response.data.map(convertSessionResponse),
    };
  }

  // POST /api/sessions
  static async createSession(session: CreateSessionRequest): Promise<ChatSession> {
    const response = await apiRequest<ApiResponse<SessionResponse>>(
      this.baseUrl,
      {
        method: 'POST',
        body: JSON.stringify(session),
      }
    );

    return convertSessionResponse(response.data);
  }

  // GET /api/sessions/{session_id}
  static async getSession(sessionId: string): Promise<ChatSession> {
    const response = await apiRequest<ApiResponse<SessionResponse>>(
      `${this.baseUrl}/${sessionId}`
    );

    return convertSessionResponse(response.data);
  }

  // PUT /api/sessions/{session_id}
  static async updateSession(
    sessionId: string,
    updates: UpdateSessionRequest
  ): Promise<ChatSession> {
    const response = await apiRequest<ApiResponse<SessionResponse>>(
      `${this.baseUrl}/${sessionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );

    return convertSessionResponse(response.data);
  }

  // DELETE /api/sessions/{session_id}
  static async deleteSession(sessionId: string): Promise<void> {
    await apiRequest<ApiResponse<null>>(
      `${this.baseUrl}/${sessionId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // GET /api/sessions/{session_id}/messages
  static async getSessionMessages(
    sessionId: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<ChatSession>> {
    const response = await apiRequest<PaginatedResponse<SessionResponse>>(
      `${this.baseUrl}/${sessionId}/messages?page=${page}&per_page=${perPage}`
    );

    return {
      ...response,
      data: response.data.map(convertSessionResponse),
    };
  }
}