'use client';

interface CitationProps {
  source: string;
  variant?: 'user' | 'assistant';
}

export default function Citation({ source, variant = 'assistant' }: CitationProps) {
  return (
    <div className={`
      text-xs px-2 py-1 rounded inline-block transition-all hover:scale-105
      ${variant === 'user' 
        ? 'text-primary-100 bg-primary-400/30' 
        : 'text-gray-600 bg-gray-50'
      }
    `}>
      📄 {source}
    </div>
  );
}
