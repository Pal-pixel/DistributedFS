'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import FileTable from '@/components/FileTable';
import FileDetailsDrawer from '@/components/FileDetailsDrawer';
import UploadModal from '@/components/UploadModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { getFiles, downloadFile, deleteFile, repairFileReplication } from '@/lib/api';
import { logActivity } from '@/lib/activity';
import { Search, Upload } from 'lucide-react';

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedFileForDetails, setSelectedFileForDetails] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const [actionState, setActionState] = useState({
    downloadingId: null,
    deletingId: null,
    repairingId: null,
  });

  const [toastMessage, setToastMessage] = useState(null);

  const fetchFilesData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const res = await getFiles();
      setFiles(res.files || res.data || []);
    } catch (err) {
      console.error('Failed to load files:', err);
      setError('Unable to load files from coordinator backend.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFilesData(true);
  }, [fetchFilesData]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter(
      (f) =>
        (f.fileName && f.fileName.toLowerCase().includes(q)) ||
        (f.fileId && f.fileId.toLowerCase().includes(q)) ||
        (f.primaryNodeId && f.primaryNodeId.toLowerCase().includes(q)) ||
        (f.replicaNodeId && f.replicaNodeId.toLowerCase().includes(q))
    );
  }, [files, searchQuery]);

  const handleDownload = async (file) => {
    setActionState((prev) => ({ ...prev, downloadingId: file.fileId }));
    try {
      await downloadFile(file.fileId, file.fileName);
      logActivity('download', `File downloaded`, `${file.fileName}`);
      setToastMessage(`Downloaded ${file.fileName}.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setToastMessage(`Download failed for ${file.fileName}.`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setActionState((prev) => ({ ...prev, downloadingId: null }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    const file = fileToDelete;
    setActionState((prev) => ({ ...prev, deletingId: file.fileId }));

    try {
      await deleteFile(file.fileId);
      logActivity('delete', `File deleted`, `${file.fileName}`);
      setFileToDelete(null);
      setToastMessage(`File "${file.fileName}" deleted.`);
      setTimeout(() => setToastMessage(null), 3000);
      fetchFilesData(false);
    } catch (err) {
      console.error('Delete failed:', err);
      setToastMessage(`Failed to delete ${file.fileName}.`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setActionState((prev) => ({ ...prev, deletingId: null }));
    }
  };

  const handleRepairSingleFile = async (file) => {
    setActionState((prev) => ({ ...prev, repairingId: file.fileId }));
    try {
      const res = await repairFileReplication(file.fileId);
      logActivity('repair', `Replica repaired`, `${file.fileName}`);
      setToastMessage(res.message || `Replica repaired for ${file.fileName}`);
      setTimeout(() => setToastMessage(null), 3000);
      fetchFilesData(false);
    } catch (err) {
      console.error('Repair error:', err);
      setToastMessage(`Repair failed for ${file.fileName}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setActionState((prev) => ({ ...prev, repairingId: null }));
    }
  };

  return (
    <div className="pb-8 bg-zinc-950 min-h-screen text-zinc-100">
      <Header
        title="Files"
        subtitle="Distributed file cluster manager"
        onRefresh={() => fetchFilesData(false)}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Banner Toast */}
        {toastMessage && (
          <div className="p-3 rounded border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs font-mono flex items-center justify-between">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="underline text-zinc-400">Dismiss</button>
          </div>
        )}

        {/* Top Controls: Search Bar & Upload */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold inline-flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>

        {/* File Count Summary */}
        <div className="text-xs font-mono text-zinc-400">
          Total: <strong className="text-zinc-100">{filteredFiles.length}</strong> files
        </div>

        {/* Main Files Table */}
        {isLoading ? (
          <LoadingState message="Loading files metadata..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchFilesData(true)} />
        ) : (
          <FileTable
            files={filteredFiles}
            onDownload={handleDownload}
            onDelete={(file) => setFileToDelete(file)}
            onViewDetails={(file) => setSelectedFileForDetails(file)}
            onRepair={handleRepairSingleFile}
            onUploadClick={() => setIsUploadModalOpen(true)}
            actionState={actionState}
          />
        )}
      </div>

      {/* File Details Side Panel Drawer */}
      <FileDetailsDrawer
        file={selectedFileForDetails}
        isOpen={!!selectedFileForDetails}
        onClose={() => setSelectedFileForDetails(null)}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => fetchFilesData(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete file?"
        message={`This will permanently delete "${fileToDelete?.fileName}" and all replicated copies.`}
        confirmLabel="Delete"
        isDanger={true}
        isLoading={actionState.deletingId === fileToDelete?.fileId}
      />
    </div>
  );
}
