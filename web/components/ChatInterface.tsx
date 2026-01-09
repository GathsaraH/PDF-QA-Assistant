'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, MessageCircle, ArrowUp } from 'lucide-react';
import Citation from './Citation';
import { showToast } from './Toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface ChatInterfaceProps {
  sessionId: string;
  isReady: boolean;
  onSessionChange?: (sessionId: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ChatInterface({ sessionId, isReady, onSessionChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId && isReady) {
      loadChatHistory();
    } else {
      setMessages([]);
    }
  }, [sessionId, isReady]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat-history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const historyMessages: Message[] = (data.messages || []).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          sources: msg.sources || []
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !isReady || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to get answer');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      loadChatHistory();
    } catch (error: any) {
      showToast(error.message || 'Failed to get answer. Please try again.', 'error');
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Something went wrong'}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 scroll-smooth"
        style={{ 
          maxHeight: 'calc(100vh - 180px)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl gradient-primary shadow-glow mb-6 animate-float">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Start a Conversation</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                {isReady 
                  ? "Ask any question about your uploaded PDF document"
                  : "Upload a PDF document first to start asking questions"
                }
              </p>
              
              {isReady && (
                <div className="flex flex-wrap justify-center gap-3">
                  {['What is this document about?', 'Summarize the key points', 'What are the main topics?'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 
                        hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600
                        transition-all duration-200 shadow-sm hover:shadow"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 animate-slide-up ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className={`
                    flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center shadow-sm
                    ${message.role === 'user' 
                      ? 'gradient-primary' 
                      : 'bg-slate-100'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-slate-600" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
                      ${message.role === 'user'
                        ? 'gradient-primary text-white rounded-tr-sm'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className={`mt-3 pt-3 ${
                        message.role === 'user' 
                          ? 'border-t border-white/20' 
                          : 'border-t border-slate-100'
                      }`}>
                        <p className={`text-xs font-semibold mb-2 ${
                          message.role === 'user' ? 'text-white/70' : 'text-slate-500'
                        }`}>
                          📚 Sources:
                        </p>
                        <div className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <Citation key={idx} source={source} variant={message.role} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3 animate-slide-up">
                  <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                    <Bot className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-primary-400 rounded-full typing-dot" />
                        <div className="h-2 w-2 bg-primary-400 rounded-full typing-dot" />
                        <div className="h-2 w-2 bg-primary-400 rounded-full typing-dot" />
                      </div>
                      <span className="text-sm text-slate-500 ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="glass border-t border-white/20 p-4 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isReady ? "Ask anything about your document..." : "Upload a PDF first..."}
              disabled={!isReady || isLoading}
              className="w-full px-5 py-3.5 pr-14 bg-white border border-slate-200 rounded-2xl 
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400
                disabled:bg-slate-50 disabled:cursor-not-allowed 
                transition-all duration-200 text-slate-700 placeholder-slate-400
                shadow-sm hover:shadow-md"
            />
            <button
              onClick={handleSend}
              disabled={!isReady || isLoading || !input.trim()}
              className="absolute right-2 p-2.5 gradient-primary text-white rounded-xl 
                hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed 
                transition-all duration-200 btn-press"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

