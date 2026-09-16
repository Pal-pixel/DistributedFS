import React, { useState } from 'react';
import UploadDropzone from './UploadDropzone';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import { logActivity } from '@/lib/activity';

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resultMetadata, setResultMetadata] = useState(null);

  if (!isOpen) return null;

  const handleClear = () => {
    setFile(null);
    setErrorMsg(null);
    setResultMetadata(null);
    setProgress(0);
  };

  const handleClose = () => {
    if (isUploading) return;
    handleClear();
    onClose();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || isUploading) return;

    setIsUploading(true);
    setErrorMsg(null);
    setResultMetadata(null);
    setProgress(0);

    try {
      const response = await uploadFile(file, (percent) => {
        setProgress(percent);
      });

      if (response && response.success) {
        const uploadedFile = response.file || {};
        setResultMetadata({
          primaryNodeId: uploadedFile.primaryNodeId || 'node-1',
          replicaNodeId: uploadedFile.replicaNodeId || 'node-2',
          fileName: file.name,
        });

        logActivity(
          'upload',
          `File uploaded`,
          `${file.name} (Primary: ${uploadedFile.primaryNodeId || 'N/A'}, Replica: ${uploadedFile.replicaNodeId || 'N/A'})`
        );

        setTimeout(() => {
          handleClear();
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setErrorMsg(response?.message || 'Upload failed. Storage node unavailable.');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-4 border-b border-zinc-800 bg-[#121215] flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Upload File
          </h3>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-zinc-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUploadSubmit} className="p-4 space-y-4">
          <UploadDropzone
            selectedFile={file}
            onFileSelect={(selected) => {
              setFile(selected);
              setErrorMsg(null);
            }}
            onClearFile={handleClear}
            disabled={isUploading}
          />

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px] text-zinc-400">
                <span>Uploading {file?.name}...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-zinc-100 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Returned Metadata */}
          {resultMetadata && (
            <div className="p-3 rounded border border-emerald-900/60 bg-emerald-950/40 text-xs font-mono space-y-1">
              <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Succeeded</span>
              </div>
              <div className="text-emerald-300 text-[11px] pt-1">
                Primary Node: <strong className="capitalize">{resultMetadata.primaryNodeId}</strong>
              </div>
              <div className="text-emerald-300 text-[11px]">
                Replica Node: <strong className="capitalize">{resultMetadata.replicaNodeId}</strong>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded border border-red-900/60 bg-red-950/40 text-xs text-red-400 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Upload Failed</span>
                <span className="text-[11px]">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-3 py-1.5 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold inline-flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
