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

export class DocumentService {
  private static baseUrl = '/api/documents';

  // GET /api/documents?page={page}&per_page={per_page}&processed={processed}
  static async getDocuments(
    page: number = 1,
    perPage: number = 20,
    processed?: boolean
  ): Promise<PaginatedResponse<Document>> {
    let url = `${this.baseUrl}?page=${page}&per_page=${perPage}`;
    if (processed !== undefined) {
      url += `&processed=${processed}`;
    }

    const response = await apiRequest<PaginatedResponse<DocumentResponse>>(url);

    return {
      ...response,
      data: response.data.map(convertDocumentResponse),
    };
  }

  // POST /api/documents
  static async createDocument(document: CreateDocumentRequest): Promise<Document> {
    const response = await apiRequest<ApiResponse<DocumentResponse>>(
      this.baseUrl,
      {
        method: 'POST',
        body: JSON.stringify(document),
      }
    );

    return convertDocumentResponse(response.data);
  }

  // GET /api/documents/{document_id}
  static async getDocument(documentId: string): Promise<Document> {
    const response = await apiRequest<ApiResponse<DocumentResponse>>(
      `${this.baseUrl}/${documentId}`
    );

    return convertDocumentResponse(response.data);
  }

  // PUT /api/documents/{document_id}
  static async updateDocument(
    documentId: string,
    updates: UpdateDocumentRequest
  ): Promise<Document> {
    const response = await apiRequest<ApiResponse<DocumentResponse>>(
      `${this.baseUrl}/${documentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );

    return convertDocumentResponse(response.data);
  }

  // DELETE /api/documents/{document_id}
  static async deleteDocument(documentId: string): Promise<void> {
    await apiRequest<ApiResponse<null>>(
      `${this.baseUrl}/${documentId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // POST /api/documents/upload - Upload de arquivo
  static async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest<ApiResponse<DocumentResponse>>(
      `${this.baseUrl}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {}, // Remove Content-Type para FormData
      }
    );

    return convertDocumentResponse(response.data);
  }

  // POST /api/documents/{document_id}/process - Processar documento
  static async processDocument(documentId: string): Promise<Document> {
    const response = await apiRequest<ApiResponse<DocumentResponse>>(
      `${this.baseUrl}/${documentId}/process`,
      {
        method: 'POST',
      }
    );

    return convertDocumentResponse(response.data);
  }

  // GET /api/documents/{document_id}/status - Status do processamento
  static async getDocumentStatus(documentId: string): Promise<{
    status: string;
    progress: number;
    error?: string;
  }> {
    return await apiRequest<{
      status: string;
      progress: number;
      error?: string;
    }>(`${this.baseUrl}/${documentId}/status`);
  }
}