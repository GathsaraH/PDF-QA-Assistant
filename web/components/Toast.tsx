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

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: 'text-white',
      text: 'text-white',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-500',
      icon: 'text-white',
      text: 'text-white',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      icon: 'text-white',
      text: 'text-white',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      icon: 'text-white',
      text: 'text-white',
    },
  };

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-lg
        animate-slide-in-right backdrop-blur-sm
        ${style.bg}
        min-w-[320px] max-w-md
      `}
    >
      <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
        <Icon className={`h-5 w-5 ${style.icon}`} />
      </div>
      <p className={`flex-1 text-sm font-medium ${style.text}`}>{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 
          flex items-center justify-center transition-colors"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
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
    <div className="fixed top-4 right-4 z-50 space-y-3">
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

