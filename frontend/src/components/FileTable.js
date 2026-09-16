import React from 'react';
import FileRow from './FileRow';
import EmptyState from './EmptyState';

export default function FileTable({
  files = [],
  onDownload,
  onDelete,
  onViewDetails,
  onRepair,
  onUploadClick,
  actionState = {},
}) {
  if (files.length === 0) {
    return (
      <EmptyState
        title="No files"
        description="Upload a file to get started."
        actionLabel="Upload"
        onAction={onUploadClick}
      />
    );
  }

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#121215] border-b border-zinc-800 font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Size</th>
              <th className="py-2.5 px-3">Primary</th>
              <th className="py-2.5 px-3">Replica</th>
              <th className="py-2.5 px-3">Replication</th>
              <th className="py-2.5 px-3">Created</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {files.map((file) => (
              <FileRow
                key={file.fileId || Math.random()}
                file={file}
                onDownload={onDownload}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
                onRepair={onRepair}
                isDownloading={actionState.downloadingId === file.fileId}
                isDeleting={actionState.deletingId === file.fileId}
                isRepairing={actionState.repairingId === file.fileId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
