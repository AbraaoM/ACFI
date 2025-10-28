'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/models/document';
import { DocumentCategory } from '@/enums/document_category_enum';
import { DocumentService } from '@/services/documentService';
import Menu from '@/components/Menu';

export default function BaseDadosPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.LEGISLACAO);
  const [tags, setTags] = useState('');

  const documentService = DocumentService();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await documentService.uploadDocument({
        file: selectedFile,
        category,
        tags
      });
      setSelectedFile(null);
      setTags('');
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  };

  return (
    <div className="flex h-screen bg-base-100">
      <Menu />
      
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Base de Dados</h1>

        {/* Upload Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload de Documento</h2>
          
          <div className="space-y-4">
            <div>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={DocumentCategory.LEGISLACAO}>Legislação</option>
                <option value={DocumentCategory.NOTAS_FISCAIS}>Notas Fiscais</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tags separadas por vírgula"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Enviando...' : 'Upload'}
            </button>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Documentos ({documents.length})</h2>
          </div>

          {loading ? (
            <div className="p-4 text-center">Carregando...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                      <p className="text-sm text-gray-500">
                        {doc.file_type.toUpperCase()} • {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                      <p className="text-sm text-gray-500">
                        Categoria: {doc.category} • Status: {doc.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        {doc.chunks_count} chunks • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
              
              {documents.length === 0 && !loading && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum documento encontrado
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}