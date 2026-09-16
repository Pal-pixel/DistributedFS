import React from 'react';
import NodeStatus from './NodeStatus';
import { X, Server, HardDrive, ShieldCheck, FileText, Calendar, Database } from 'lucide-react';

export default function FileDetailsModal({ file, isOpen, onClose }) {
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

  const isReplicated = file.replicaNodeId && file.replicationFactor >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-sm">
                {file.fileName || 'File Details'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {file.fileId || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Database className="w-4 h-4" />
              <span>General Metadata</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Size</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formatSize(file.size)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Content Type</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {file.contentType || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Replication Factor</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {file.replicationFactor || 1} copies
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Created At</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatDate(file.createdAt)}
                </span>
              </div>
            </div>

            {/* Checksum Hash Box */}
            <div className="mt-3 p-3 rounded-lg bg-slate-900 text-white font-mono text-xs border border-slate-800 flex flex-col space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>File Checksum Integrity Hash</span>
                </span>
                <span>SHA-256</span>
              </div>
              <span className="break-all text-slate-300">
                {file.checksum || 'N/A'}
              </span>
            </div>
          </div>

          {/* Node Allocation Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-indigo-500" />
              <span>Storage Allocation Topology</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Node Card */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                    Primary Node
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                    Primary
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Node ID:</span>
                    <span className="font-mono font-bold capitalize text-slate-800 dark:text-slate-200">
                      {file.primaryNodeId || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Host:Port:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {file.primaryNodeHost || 'localhost'}:{file.primaryNodePort || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                    <span className="text-slate-400">Storage File:</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={file.primaryStorageName}>
                      {file.primaryStorageName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Replica Node Card */}
              <div className={`p-4 rounded-xl border ${
                file.replicaNodeId 
                  ? 'border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20'
                  : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    file.replicaNodeId ? 'text-purple-700 dark:text-purple-400' : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    Replica Node
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                    file.replicaNodeId ? 'bg-purple-600' : 'bg-amber-600'
                  }`}>
                    {file.replicaNodeId ? 'Replica' : 'Missing'}
                  </span>
                </div>

                {file.replicaNodeId ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Node ID:</span>
                      <span className="font-mono font-bold capitalize text-slate-800 dark:text-slate-200">
                        {file.replicaNodeId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Host:Port:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {file.replicaNodeHost || 'localhost'}:{file.replicaNodePort || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-purple-100 dark:border-purple-900/40">
                      <span className="text-slate-400">Storage File:</span>
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={file.replicaStorageName}>
                        {file.replicaStorageName || 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-xs text-amber-700 dark:text-amber-400">
                    No secondary replica allocated. Perform a replication repair to resolve missing copy.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
