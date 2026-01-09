'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import { FileText, MessageSquare } from 'lucide-react';

export default function Home() {
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [isReady, setIsReady] = useState(false);
  const [chunksCount, setChunksCount] = useState(0);

  const handleUploadSuccess = (sessionId: string, chunks: number) => {
    setIsReady(true);
    setChunksCount(chunks);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PDF Document Q&A Assistant
          </h1>
          <p className="text-gray-600">
            Upload a PDF and ask questions about it using AI-powered RAG
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Upload */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-6 w-6 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900">Upload PDF</h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                sessionId={sessionId}
              />
            </div>
            {isReady && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ PDF processed successfully! ({chunksCount} chunks ready)
                </p>
              </div>
            )}
          </div>

          {/* Right Panel - Chat */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-6 w-6 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900">Ask Questions</h2>
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface sessionId={sessionId} isReady={isReady} />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by LangChain, OpenAI, and Pinecone</p>
        </div>
      </div>
    </div>
  );
}

