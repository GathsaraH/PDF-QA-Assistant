'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle2, File, Cloud } from 'lucide-react';
import { UploadLoader, ProcessingLoader } from './Loader';
import { showToast } from './Toast';

interface FileUploadProps {
  onUploadSuccess: (sessionId: string, chunks: number) => void;
  sessionId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function FileUpload({ onUploadSuccess, sessionId }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Upload failed');
      }

      setIsUploading(false);
      setIsProcessing(true);

      const steps = [0, 1, 2, 3, 4];
      for (const step of steps) {
        setProcessingStep(step);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setIsProcessing(false);
      showToast(`PDF processed successfully! ${data.chunks} chunks ready.`, 'success');
      onUploadSuccess(sessionId, data.chunks);
    } catch (error: any) {
      setIsUploading(false);
      setIsProcessing(false);
      setUploadedFile(null);
      showToast(error.message || 'Failed to upload file. Please try again.', 'error');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isProcessing) {
    return (
      <div className="w-full">
        <ProcessingLoader step={processingStep} />
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="w-full">
        <UploadLoader progress={uploadProgress} message="Uploading PDF..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-glow mb-4 animate-float">
          <Cloud className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Your PDF</h2>
        <p className="text-slate-500">Drop your document here and start asking questions</p>
      </div>

      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative overflow-hidden
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 ease-out
            bg-white/80 backdrop-blur-sm
            ${isDragging 
              ? 'border-primary-500 bg-primary-50/80 scale-[1.02] shadow-glow' 
              : 'border-slate-300 hover:border-primary-400 hover:bg-white hover:shadow-lg'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full transition-all duration-500 ${
              isDragging ? 'bg-primary-200/50 scale-150' : 'bg-slate-100/50'
            }`} />
            <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full transition-all duration-500 ${
              isDragging ? 'bg-secondary-200/50 scale-150' : 'bg-slate-100/50'
            }`} />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading || isProcessing}
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`
              h-20 w-20 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragging 
                ? 'gradient-primary shadow-glow scale-110' 
                : 'bg-slate-100'
              }
            `}>
              <Upload className={`h-10 w-10 transition-all duration-300 ${
                isDragging ? 'text-white animate-bounce' : 'text-slate-400'
              }`} />
            </div>
            
            <div>
              <p className={`text-lg font-semibold mb-2 transition-colors ${
                isDragging ? 'text-primary-600' : 'text-slate-700'
              }`}>
                {isDragging ? 'Drop your PDF here!' : 'Drop PDF here or click to browse'}
              </p>
              <p className="text-sm text-slate-500">
                Supports PDF files up to 10MB
              </p>
            </div>

            {/* Features */}
            <div className="flex items-center justify-center space-x-6 pt-4 text-xs text-slate-400">
              <span className="flex items-center">
                <File className="h-3.5 w-3.5 mr-1" />
                PDF only
              </span>
              <span>•</span>
              <span>Max 10MB</span>
              <span>•</span>
              <span>Secure upload</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 border border-green-200 bg-green-50/50 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-lg">{uploadedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2.5 hover:bg-red-100 rounded-xl transition-colors group"
              title="Remove file"
            >
              <X className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

