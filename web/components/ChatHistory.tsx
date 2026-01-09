'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Clock } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  created_at: string;
}

interface ChatHistoryProps {
  sessionId: string;
  onMessageClick?: (message: Message) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ChatHistory({ sessionId, onMessageClick }: ChatHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchHistory();
    }
  }, [sessionId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/chat-history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No chat history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          onClick={() => onMessageClick?.(message)}
          className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-start space-x-2">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              message.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {message.role === 'user' ? 'U' : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 line-clamp-2">
                {message.content}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatTime(message.created_at)}
                </span>
                {message.sources && message.sources.length > 0 && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-primary-600">
                      {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

