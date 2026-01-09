'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ChatInterface({ sessionId, isReady }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12 animate-fade-in">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Ask questions about your PDF</p>
            <p className="text-sm">Try: "What is this document about?"</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 animate-slide-in ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.role === 'user' 
                  ? 'bg-primary-500' 
                  : 'bg-gray-200'
                }
              `}>
                {message.role === 'user' ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl p-4 shadow-sm transition-all duration-300 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className={`mt-3 pt-3 ${
                    message.role === 'user' 
                      ? 'border-t border-primary-400' 
                      : 'border-t border-gray-300'
                  }`}>
                    <p className={`text-xs font-semibold mb-2 ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-600'
                    }`}>
                      Sources:
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
          ))
        )}
        {isLoading && (
          <div className="flex items-start space-x-3 animate-slide-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="h-5 w-5 text-gray-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="h-1 w-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1 w-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1 w-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isReady ? "Ask a question..." : "Upload a PDF first..."}
            disabled={!isReady || isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!isReady || isLoading || !input.trim()}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

