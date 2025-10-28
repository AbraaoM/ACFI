import { Document } from "@/models/document";
import { DocumentCategory } from "@/enums/document_category_enum";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

interface UploadDocumentRequest {
  file: File;
  category?: DocumentCategory;
  tags?: string;
}

export function DocumentService() {
  const uploadDocument = async (request: UploadDocumentRequest) => {
    const { file, category = DocumentCategory.LEGISLACAO, tags = "" } = request;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('tags', tags);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  };

  const getDocuments = async (
    skip: number = 0,
    limit: number = 100
  ): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/documents?skip=${skip}&limit=${limit}`);
    return response.json();
  };

  const getDocument = async (documentId: string): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);
    return response.json();
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/documents/${documentId}`, { method: 'DELETE' });
  };

  const getVectorStoreInfo = async () => {
    const response = await fetch(`${API_BASE_URL}/documents/vector/info`);
    return response.json();
  };

  return { uploadDocument, getDocuments, getDocument, deleteDocument, getVectorStoreInfo };
}