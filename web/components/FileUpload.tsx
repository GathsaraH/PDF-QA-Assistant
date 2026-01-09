'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
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
      // Simulate upload progress
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

      // Show processing animation
      setIsUploading(false);
      setIsProcessing(true);

      // Simulate processing steps
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
      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-300 transform
            ${isDragging 
              ? 'border-primary-500 bg-primary-50 scale-105 shadow-lg' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 hover:scale-102'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
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
              p-4 rounded-full transition-all duration-300
              ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}
            `}>
              <Upload className={`h-10 w-10 transition-colors duration-300 ${
                isDragging ? 'text-primary-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 mb-1">
                {isDragging ? 'Drop your PDF here' : 'Drop PDF here or click to upload'}
              </p>
              <p className="text-sm text-gray-500">Only PDF files are supported (max 10MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-500 rounded-xl p-4 bg-green-50 flex items-center justify-between animate-slide-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 hover:bg-green-100 rounded-full transition-colors"
            title="Remove file"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}

