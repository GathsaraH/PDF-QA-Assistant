'use client';

import { FileText } from 'lucide-react';

interface CitationProps {
  source: string;
  variant?: 'user' | 'assistant';
}

export default function Citation({ source, variant = 'assistant' }: CitationProps) {
  return (
    <div className={`
      inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg 
      transition-all duration-200 hover:scale-105 cursor-default
      ${variant === 'user' 
        ? 'text-white/90 bg-white/20' 
        : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
      }
    `}>
      <FileText className="h-3 w-3" />
      <span>{source}</span>
    </div>
  );
}
