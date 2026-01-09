'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastComponent({ toast, onClose }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
  };

  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`
        flex items-center space-x-3 p-4 rounded-lg border shadow-lg
        animate-slide-in-right
        ${colors[toast.type]}
        min-w-[300px] max-w-md
      `}
    >
      <Icon className={`h-5 w-5 ${iconColors[toast.type]} flex-shrink-0`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listen for toast events
    const handleToast = (e: CustomEvent<{ message: string; type: ToastType }>) => {
      const toast: Toast = {
        id: Date.now().toString(),
        message: e.detail.message,
        type: e.detail.type,
      };
      setToasts((prev) => [...prev, toast]);
    };

    window.addEventListener('show-toast', handleToast as EventListener);

    return () => {
      window.removeEventListener('show-toast', handleToast as EventListener);
    };
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  );
}

// Helper function to show toast
export function showToast(message: string, type: ToastType = 'info') {
  const event = new CustomEvent('show-toast', {
    detail: { message, type },
  });
  window.dispatchEvent(event);
}

