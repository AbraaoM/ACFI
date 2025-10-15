// Chat Models
export type {
  ChatMessage,
  CreateChatMessageRequest,
  ChatMessageResponse,
} from './chat';

export {
  convertChatMessageResponse,
  convertChatMessageToRequest,
} from './chat';

// Session Models
export type {
  ChatSession,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionResponse,
} from './session';

export {
  convertSessionResponse,
  convertSessionToCreateRequest,
  convertSessionToUpdateRequest,
} from './session';

// Document Models
export type {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentResponse,
} from './document';

export {
  convertDocumentResponse,
  convertDocumentToCreateRequest,
  convertDocumentToUpdateRequest,
} from './document';

// Common types para API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}