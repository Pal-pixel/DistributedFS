import React, { useRef, useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

export default function UploadDropzone({ onFileSelect, selectedFile, onClearFile, disabled = false }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {selectedFile ? (
        <div className="p-3 rounded border border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate">
            <File className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="truncate text-xs">
              <span className="font-semibold text-zinc-100 truncate block">
                {selectedFile.name}
              </span>
              <span className="font-mono text-zinc-500 text-[10px]">
                {formatSize(selectedFile.size)}
              </span>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={onClearFile}
              className="p-1 text-zinc-500 hover:text-zinc-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`py-8 px-4 rounded border border-dashed text-center transition-colors cursor-pointer ${
            isDragOver ? 'border-zinc-500 bg-zinc-800/80' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <UploadCloud className="w-6 h-6 text-zinc-500 mx-auto mb-1.5" />
          <div className="text-xs font-semibold text-zinc-200">
            Drop file here or choose a file
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
            Coordinator will allocate primary & replica storage nodes
          </div>
        </div>
      )}
    </div>
  );
}
