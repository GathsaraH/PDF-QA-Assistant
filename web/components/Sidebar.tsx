'use client';

import { useState, useEffect } from 'react';
import { FileText, X, Search, FolderOpen, Clock, Sparkles, Trash2 } from 'lucide-react';
import { showToast } from './Toast';

interface Document {
  id: string;
  session_id: string;
  filename: string;
  chunk_count: number;
  uploaded_at: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (sessionId: string) => void;
  currentSessionId: string;
  refreshTrigger?: number; // Trigger refresh when this changes
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Sidebar({ isOpen, onClose, onSelectDocument, currentSessionId, refreshTrigger }: SidebarProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch documents when sidebar opens or when refresh trigger changes (after upload)
    if (isOpen || refreshTrigger) {
      fetchDocuments();
    }
  }, [isOpen, refreshTrigger]); // Refresh when isOpen changes OR refreshTrigger changes

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, sessionId: string, filename: string) => {
    e.stopPropagation(); // Prevent document selection
    
    if (!confirm(`Are you sure you want to delete "${filename}"?\n\nThis will delete the document, all chat history, and related data.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/document/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast(`Document "${filename}" deleted successfully`, 'success');
        // Refresh documents list
        fetchDocuments();
        // If deleted document was current, reset to first available or empty
        if (sessionId === currentSessionId) {
          const remainingDocs = documents.filter(d => d.session_id !== sessionId);
          if (remainingDocs.length > 0) {
            onSelectDocument(remainingDocs[0].session_id);
          }
        }
      } else {
        const data = await response.json();
        showToast(data.detail || 'Failed to delete document', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete document', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-slate-900 shadow-2xl
          transform transition-all duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Documents</h2>
                <p className="text-xs text-slate-400">{documents.length} files</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent 
                text-sm text-white placeholder-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 dark-scroll">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-10 w-10 mx-auto mb-4 rounded-xl bg-slate-800 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-slate-500">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                <FileText className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-400 mb-1">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </p>
              <p className="text-xs text-slate-500">
                {searchQuery ? 'Try a different search' : 'Upload a PDF to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className={`
                    group relative p-3.5 rounded-xl cursor-pointer transition-all duration-200
                    animate-fade-in
                    ${
                      doc.session_id === currentSessionId
                        ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30 shadow-glow'
                        : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700/50'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    onClick={() => {
                      onSelectDocument(doc.session_id);
                      onClose();
                    }}
                    className="flex items-start space-x-3"
                  >
                    <div className={`
                      p-2.5 rounded-xl transition-colors
                      ${doc.session_id === currentSessionId 
                        ? 'bg-primary-500/20' 
                        : 'bg-slate-700/50'
                      }
                    `}>
                      <FileText className={`h-4 w-4 ${
                        doc.session_id === currentSessionId ? 'text-primary-400' : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        doc.session_id === currentSessionId ? 'text-white' : 'text-slate-200'
                      }`}>
                        {doc.filename}
                      </p>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-slate-700/50 text-slate-400">
                          {doc.chunk_count} chunks
                        </span>
                        <span className="flex items-center text-xs text-slate-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(doc.uploaded_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, doc.session_id, doc.filename)}
                    className="absolute top-2 right-2 p-1.5 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-400 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </>
  );
}

