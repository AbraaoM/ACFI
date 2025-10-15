export interface Document {
  id: string;
  filename: string;
  content_type: string;
  file_size: number;
  content?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    pages?: number;
    [key: string]: any;
  };
  processed: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDocumentRequest {
  filename: string;
  content_type: string;
  file_size: number;
  content?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    pages?: number;
    [key: string]: any;
  };
}

export interface UpdateDocumentRequest {
  filename?: string;
  content?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    pages?: number;
    [key: string]: any;
  };
  processed?: boolean;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
}

export interface DocumentResponse {
  id: string;
  filename: string;
  content_type: string;
  file_size: number;
  content?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    pages?: number;
    [key: string]: any;
  };
  processed: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  created_at: string;
  updated_at: string;
}

// Utility functions para conversão
export const convertDocumentResponse = (response: DocumentResponse): Document => ({
  ...response,
  created_at: new Date(response.created_at),
  updated_at: new Date(response.updated_at),
});

export const convertDocumentToCreateRequest = (document: Partial<Document>): CreateDocumentRequest => ({
  filename: document.filename!,
  content_type: document.content_type!,
  file_size: document.file_size!,
  content: document.content,
  metadata: document.metadata,
});

export const convertDocumentToUpdateRequest = (document: Partial<Document>): UpdateDocumentRequest => ({
  filename: document.filename,
  content: document.content,
  metadata: document.metadata,
  processed: document.processed,
  processing_status: document.processing_status,
  processing_error: document.processing_error,
});