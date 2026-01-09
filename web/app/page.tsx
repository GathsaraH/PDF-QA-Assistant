'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import ChatHistory from '@/components/ChatHistory';
import { ToastContainer } from '@/components/Toast';
import { MessageSquare, Upload, Sparkles, FileText, Menu, X } from 'lucide-react';

export default function Home() {
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);
  const [isReady, setIsReady] = useState(false);
  const [chunksCount, setChunksCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  const handleUploadSuccess = (sessionId: string, chunks: number) => {
    setIsReady(true);
    setChunksCount(chunks);
    setSessionId(sessionId);
    setActiveTab('chat');
    // Trigger sidebar refresh to show new document
    setSidebarRefreshTrigger(prev => prev + 1);
  };

  const handleSelectDocument = (newSessionId: string) => {
    setSessionId(newSessionId);
    setIsReady(true);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <ToastContainer />
      
      {/* Background gradient decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectDocument={handleSelectDocument}
          currentSessionId={sessionId}
          refreshTrigger={sidebarRefreshTrigger}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="glass border-b border-white/20 sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 lg:hidden"
                  >
                    {sidebarOpen ? (
                      <X className="h-5 w-5 text-slate-600" />
                    ) : (
                      <Menu className="h-5 w-5 text-slate-600" />
                    )}
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold gradient-text">PDF Assistant</h1>
                      <p className="text-xs text-slate-500">AI-Powered Document Q&A</p>
                    </div>
                  </div>
                </div>
                
                {/* Tab Pills */}
                <div className="hidden sm:flex items-center bg-white/50 rounded-2xl p-1.5 shadow-sm">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === 'upload'
                        ? 'gradient-primary text-white shadow-md'
                        : 'text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === 'chat'
                        ? 'gradient-primary text-white shadow-md'
                        : 'text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                    {isReady && (
                      <span className="ml-1 h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:flex p-2.5 hover:bg-white/50 rounded-xl transition-all duration-200"
                  title="Toggle Sidebar"
                >
                  <FileText className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              {/* Mobile Tabs */}
              <div className="flex sm:hidden items-center bg-white/50 rounded-2xl p-1.5 mt-4 shadow-sm">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'upload'
                      ? 'gradient-primary text-white shadow-md'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'chat'
                      ? 'gradient-primary text-white shadow-md'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                  {isReady && (
                    <span className="ml-1 h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'upload' ? (
              <div className="h-full flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-2xl animate-fade-in">
                  <FileUpload
                    onUploadSuccess={handleUploadSuccess}
                    sessionId={sessionId}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <ChatInterface
                  sessionId={sessionId}
                  isReady={isReady}
                  onSessionChange={setSessionId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
