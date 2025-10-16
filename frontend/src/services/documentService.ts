import { apiRequest } from './api';
import {
  Document,
  DocumentResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  convertDocumentResponse,
  ApiResponse,
  PaginatedResponse,
} from '@/models';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SearchDocumentsRequest {
  query: string;
  limit?: number;
  offset?: number;
  type?: string;
}

export interface PaginatedDocumentResponse {
  data: DocumentResponse[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// Converter response do backend para o formato do frontend
function convertDocument(document: DocumentResponse) {
  return {
    id: document.id,
    title: document.title,
    content: document.content,
    type: document.type,
    source: document.source,
    created_at: new Date(document.created_at),
    updated_at: new Date(document.updated_at),
  };
}

export const DocumentService = {
  async searchDocuments(query: string, limit = 10, offset = 0, type?: string) {
    let url = `${API_BASE_URL}/api/documents/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
    if (type) {
      url += `&type=${type}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar documentos: ${response.status}`);
    }

    const data: PaginatedDocumentResponse = await response.json();

    return {
      ...data,
      data: data.data.map(convertDocument),
    };
  },

  async getDocument(documentId: string) {
    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar documento: ${response.status}`);
    }

    const data: { data: DocumentResponse } = await response.json();
    return convertDocument(data.data);
  },

  async uploadDocument(file: File, metadata?: { type?: string; source?: string }) {
    const formData = new FormData();
    formData.append('file', file);

    if (metadata?.type) {
      formData.append('type', metadata.type);
    }
    if (metadata?.source) {
      formData.append('source', metadata.source);
    }

    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro ao fazer upload do documento: ${response.status}`);
    }

    const data: { data: DocumentResponse } = await response.json();
    return convertDocument(data.data);
  },

  async deleteDocument(documentId: string) {
    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar documento: ${response.status}`);
    }
  },
};