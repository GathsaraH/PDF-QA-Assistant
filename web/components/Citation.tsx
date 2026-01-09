'use client';

import { FileText } from 'lucide-react';

interface CitationProps {
  source: string;
}

export default function Citation({ source }: CitationProps) {
  return (
    <div className="flex items-center space-x-2 text-xs text-gray-600">
      <FileText className="h-3 w-3" />
      <span>{source}</span>
    </div>
  );
}

