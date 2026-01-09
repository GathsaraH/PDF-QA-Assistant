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
        <div
          className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-primary-500 rounded-full animate-pulse" />
        </div>
      </div>
      {message && (
        <p className="text-sm text-slate-600 animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Upload-specific loader with progress
export function UploadLoader({ progress, message }: { progress?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="relative w-28 h-28">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />
        
        {/* Circular progress */}
        <svg className="transform -rotate-90 w-28 h-28 relative z-10">
          <circle
            cx="56"
            cy="56"
            r="48"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-slate-200"
          />
          <circle
            cx="56"
            cy="56"
            r="48"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 48}`}
            strokeDashoffset={`${2 * Math.PI * 48 * (1 - (progress || 0) / 100)}`}
            className="transition-all duration-300"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <svg
              className="h-6 w-6 text-white animate-bounce"
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
          <p className="text-base font-medium text-slate-700">{message}</p>
          {progress !== undefined && (
            <p className="text-sm text-slate-500 mt-1">{progress}% uploaded</p>
          )}
        </div>
      )}
    </div>
  );
}

// Processing steps loader
export function ProcessingLoader({ step }: { step: number }) {
  const steps = [
    { label: 'Extracting text from PDF', icon: '📄', desc: 'Reading document content' },
    { label: 'Splitting into chunks', icon: '✂️', desc: 'Organizing text blocks' },
    { label: 'Creating embeddings', icon: '🧠', desc: 'Generating AI vectors' },
    { label: 'Storing in database', icon: '💾', desc: 'Saving to Pinecone' },
    { label: 'Finalizing', icon: '✨', desc: 'Almost ready!' },
  ];

  const currentStep = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      {/* Animated icon */}
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full gradient-primary opacity-20 blur-xl animate-pulse" 
          style={{ width: '140px', height: '140px', left: '-10px', top: '-10px' }} />
        
        <div className="relative w-32 h-32">
          {/* Spinning ring */}
          <div className="absolute inset-0">
            <svg className="w-32 h-32 animate-spin" style={{ animationDuration: '3s' }}>
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="url(#processingGradient)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="100 260"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="processingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="50%" stopColor="#764ba2" />
                  <stop offset="100%" stopColor="#f093fb" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Inner content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl animate-float">
              {currentStep.icon}
            </div>
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-slate-800">
          {currentStep.label}
        </p>
        <p className="text-sm text-slate-500">
          {currentStep.desc}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center space-x-3">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-500 ${
              index <= step 
                ? 'h-3 w-3 gradient-primary rounded-full shadow-glow' 
                : 'h-2 w-2 bg-slate-200 rounded-full'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full gradient-primary rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

