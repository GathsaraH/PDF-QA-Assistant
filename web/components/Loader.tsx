'use client';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loader({ message = 'Loading...', size = 'md' }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        {/* Outer spinning ring */}
        <div
          className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`}
        />
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-primary-500 rounded-full animate-pulse" />
        </div>
      </div>
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Upload-specific loader with progress
export function UploadLoader({ progress, message }: { progress?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative w-24 h-24">
        {/* Circular progress */}
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-primary-200"
          />
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - (progress || 0) / 100)}`}
            className="text-primary-500 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
        </div>
      </div>
      {message && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{message}</p>
          {progress !== undefined && (
            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
          )}
        </div>
      )}
    </div>
  );
}

// Processing steps loader
export function ProcessingLoader({ step }: { step: number }) {
  const steps = [
    { label: 'Extracting text from PDF...', icon: '📄' },
    { label: 'Splitting into chunks...', icon: '✂️' },
    { label: 'Creating embeddings...', icon: '🔢' },
    { label: 'Storing in vector database...', icon: '💾' },
    { label: 'Almost done...', icon: '✨' },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="relative w-32 h-32">
        {/* Animated circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 border-4 border-primary-200 rounded-full animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 border-4 border-primary-300 rounded-full animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 bg-primary-500 rounded-full flex items-center justify-center text-2xl">
            {steps[Math.min(step, steps.length - 1)].icon}
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-700">
          {steps[Math.min(step, steps.length - 1)].label}
        </p>
        <div className="flex space-x-1 justify-center">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index <= step ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

