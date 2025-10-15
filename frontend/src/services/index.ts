export { ChatService } from './chatService';
export { SessionService } from './sessionService';
export { DocumentService } from './documentService';
export { apiRequest, ApiError } from './api';

// Re-export dos types necessários
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError as IApiError,
} from '@/models';