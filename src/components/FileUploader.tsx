import { useState, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

interface FileData {
  id: number;
  file: File;
  name: string;
  extension: string;
  size: number;
  type: string;
}

export default function FileUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Expose files to window object so form submission can access them
  useEffect(() => {
    (window as any).uploadedFiles = uploadedFiles.map(f => f.file);
  }, [uploadedFiles]);

  const getFileIcon = (type: string, filename: string) => {
    if (type.startsWith('audio/') || type.includes('mp3') || type.includes('wav')) {
      return '🎵';
    } else if (type.startsWith('image/')) {
      return '🖼️';
    }
    return '📄';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const addFiles = (newFiles: FileList) => {
    const filesArray = Array.from(newFiles).map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      extension: getExtension(file.name),
      size: file.size,
      type: file.type,
    }));
    setUploadedFiles(prev => [...prev, ...filesArray]);
  };

  const deleteFile = (id: number) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all files?')) {
      setUploadedFiles([]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 transition-all cursor-pointer p-12 rounded-lg ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-dashed border-gray-300 hover:border-blue-400 bg-gray-50'
        }`}
      >
        <input
          type="file"
          multiple
          accept="audio/*,image/*,.mp3,.wav"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="pointer-events-none text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          <p className="text-gray-700 font-medium mb-1">Drop files here or click to browse</p>
         <p className="text-gray-500 text-sm">MP3, WAV, JPG, PNG accepted</p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
            <span className="font-semibold">Files ({uploadedFiles.length})</span>
            <button 
              type="button"
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {uploadedFiles.map(file => {
              const icon = getFileIcon(file.type, file.name);
              return (
                <div 
                  key={file.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="text-2xl">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-900 font-medium truncate text-sm">{file.name}</p>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {file.extension}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => deleteFile(file.id)}
                    className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                    title="Delete file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <input type="hidden" name="filesData" value={JSON.stringify(uploadedFiles.map(f => f.name))} />
    </>
  );
}