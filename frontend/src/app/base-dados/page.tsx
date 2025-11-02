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
    if (!confirm('Tem certeza que deseja deletar este documento?')) return;
    
    try {
      await documentService.deleteDocument(documentId);
      await loadDocuments();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'pending': 'badge-warning',
      'processing': 'badge-info',
      'completed': 'badge-success',
      'error': 'badge-error'
    };
    return badges[status as keyof typeof badges] || 'badge-neutral';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'legislacao': '⚖️',
      'notas_fiscais': '🧾'
    };
    return icons[category as keyof typeof icons] || '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const truncateFilename = (filename: string, maxLength: number = 25) => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop();
    const nameWithoutExtension = filename.slice(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExtension.slice(0, maxLength - extension!.length - 4);
    
    return `${truncatedName}...${extension}`;
  };

  const getTotalSize = () => {
    const totalBytes = documents.reduce((acc, doc) => acc + doc.file_size, 0);
    return formatFileSize(totalBytes);
  };

  const getDocumentsByCategory = (cat: string) => {
    return documents.filter(d => d.category === cat).length;
  };

  return (
    <div className="flex h-screen bg-base-100">
      <Menu />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">📚 Base de Dados</h1>
            <p className="text-base-content/70">Gerencie seus documentos e alimente a base de conhecimento do sistema</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="stat bg-primary text-primary-content rounded-box">
              <div className="stat-figure">
                <div className="text-3xl">📊</div>
              </div>
              <div className="stat-title text-primary-content/70">Total de Documentos</div>
              <div className="stat-value">{documents.length}</div>
              <div className="stat-desc text-primary-content/60">{getTotalSize()} em armazenamento</div>
            </div>
            
            <div className="stat bg-secondary text-secondary-content rounded-box">
              <div className="stat-figure">
                <div className="text-3xl">⚖️</div>
              </div>
              <div className="stat-title text-secondary-content/70">Legislação</div>
              <div className="stat-value">{getDocumentsByCategory('legislacao')}</div>
              <div className="stat-desc text-secondary-content/60">documentos legais</div>
            </div>
            
            <div className="stat bg-accent text-accent-content rounded-box">
              <div className="stat-figure">
                <div className="text-3xl">🧾</div>
              </div>
              <div className="stat-title text-accent-content/70">Notas Fiscais</div>
              <div className="stat-value">{getDocumentsByCategory('notas_fiscais')}</div>
              <div className="stat-desc text-accent-content/60">NFes processadas</div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">📤</div>
                <h2 className="card-title text-primary">Upload de Documento</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">📁 Selecionar Arquivo</span>
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="file-input file-input-bordered file-input-primary w-full"
                      accept=".pdf,.txt,.docx,.xml"
                    />
                    <label className="label">
                      <span className="label-text-alt">Formatos aceitos: PDF, TXT, DOCX, XML</span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">🏷️ Categoria</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                      className="select select-bordered select-primary w-full"
                    >
                      <option value={DocumentCategory.LEGISLACAO}>⚖️ Legislação</option>
                      <option value={DocumentCategory.NOTAS_FISCAIS}>🧾 Notas Fiscais</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">🏷️ Tags</span>
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="icms, tributario, fiscal..."
                      className="input input-bordered input-primary w-full"
                    />
                    <label className="label">
                      <span className="label-text-alt">Separe as tags por vírgula</span>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className={`btn btn-primary btn-lg ${uploading ? 'loading' : ''}`}
                    >
                      {uploading ? 'Processando...' : '🚀 Fazer Upload'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📋</div>
                  <h2 className="card-title text-primary">Documentos na Base ({documents.length})</h2>
                </div>
                <button 
                  onClick={loadDocuments}
                  className="btn btn-outline btn-primary btn-sm"
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : '🔄 Atualizar'}
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum documento encontrado</h3>
                  <p className="text-base-content/70">Comece fazendo o upload do seu primeiro documento!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="card-body p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xl flex-shrink-0">{getCategoryIcon(doc.category)}</span>
                            <h3 className="font-bold text-sm min-w-0 break-words" title={doc.filename}>
                              {truncateFilename(doc.filename)}
                            </h3>
                          </div>
                          <div className="dropdown dropdown-end flex-shrink-0">
                            <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                              ⋮
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                              <li>
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="text-error hover:bg-error hover:text-error-content"
                                >
                                  🗑️ Deletar
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-base-content/70">Tipo:</span>
                            <span className="badge badge-outline badge-sm">{doc.file_type.toUpperCase()}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-base-content/70">Tamanho:</span>
                            <span>{formatFileSize(doc.file_size)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-base-content/70">Status:</span>
                            <span className={`badge badge-sm ${getStatusBadge(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-base-content/70">Data:</span>
                            <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        <div className="card-actions justify-end mt-4">
                          <div className="badge badge-primary badge-sm">{doc.category}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}