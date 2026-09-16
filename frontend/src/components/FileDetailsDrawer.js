import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

export default function FileDetailsDrawer({ file, isOpen, onClose }) {
  if (!isOpen || !file) return null;

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col text-zinc-100">
          {/* Header */}
          <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between bg-[#121215]">
            <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-300">
              File Details
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            {/* Title & Size */}
            <div>
              <h2 className="text-sm font-bold text-zinc-100 truncate">
                {file.fileName || 'Untitled File'}
              </h2>
              <div className="font-mono text-zinc-400 mt-0.5">
                {formatSize(file.size)} • {file.contentType || 'binary'}
              </div>
            </div>

            {/* Identifiers Section */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block mb-0.5">
                  File ID
                </span>
                <span className="font-mono text-zinc-200 break-all select-all text-[11px] block bg-zinc-950 p-2 rounded border border-zinc-800">
                  {file.fileId || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block mb-0.5">
                  Checksum Hash (SHA-256)
                </span>
                <span className="font-mono text-zinc-200 break-all select-all text-[11px] block bg-zinc-950 p-2 rounded border border-zinc-800">
                  {file.checksum || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block mb-0.5">
                  Created At
                </span>
                <span className="font-mono text-zinc-300">
                  {formatDate(file.createdAt)}
                </span>
              </div>
            </div>

            {/* Replication Diagram Section */}
            <div className="pt-3 border-t border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider block mb-3">
                Replication Architecture
              </span>

              <div className="p-3 rounded border border-zinc-800 bg-zinc-950/60 space-y-3">
                <div className="font-mono text-xs">
                  <div className="text-zinc-400 text-[10px] uppercase font-semibold">Primary Storage</div>
                  <div className="font-bold text-zinc-100 capitalize">{file.primaryNodeId || 'N/A'}</div>
                  <div className="text-zinc-400 text-[11px]">{file.primaryNodeHost || 'localhost'}:{file.primaryNodePort}</div>
                  <div className="text-zinc-500 text-[10px] truncate">{file.primaryStorageName}</div>
                </div>

                <div className="pl-3 border-l-2 border-zinc-700 font-mono text-xs my-2">
                  <div className="text-zinc-400 text-[10px]">└──── 2x Replicated</div>
                </div>

                <div className="font-mono text-xs">
                  <div className="text-zinc-400 text-[10px] uppercase font-semibold">Replica Storage</div>
                  {file.replicaNodeId ? (
                    <>
                      <div className="font-bold text-zinc-100 capitalize">{file.replicaNodeId}</div>
                      <div className="text-zinc-400 text-[11px]">{file.replicaNodeHost || 'localhost'}:{file.replicaNodePort}</div>
                      <div className="text-zinc-500 text-[10px] truncate">{file.replicaStorageName}</div>
                    </>
                  ) : (
                    <div className="text-amber-400 text-xs font-semibold mt-0.5">
                      Replica Missing (Repair required)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-900 flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
