'use client';

import React, { useState, useRef, useEffect } from 'react';
import NodeStatus from './NodeStatus';
import {
  FileText,
  Image as ImageIcon,
  Archive,
  Table as TableIcon,
  File,
  MoreVertical,
  Download,
  Info,
  Trash2,
  Wrench,
  Loader2,
} from 'lucide-react';

export default function FileRow({
  file,
  onDownload,
  onDelete,
  onViewDetails,
  onRepair,
  isDownloading = false,
  isDeleting = false,
  isRepairing = false,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const determineStatus = () => {
    if (!file.primaryNodeId) return 'Incomplete';
    if (!file.replicaNodeId || file.replicationFactor < 2) return 'Needs Repair';
    return 'Healthy';
  };

  const statusLabel = determineStatus();

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getFileIcon = (contentType = '') => {
    if (contentType.includes('pdf') || contentType.includes('document'))
      return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
    if (contentType.includes('image'))
      return <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />;
    if (contentType.includes('csv') || contentType.includes('json') || contentType.includes('excel'))
      return <TableIcon className="w-3.5 h-3.5 text-zinc-400" />;
    if (contentType.includes('zip') || contentType.includes('compressed') || contentType.includes('tar'))
      return <Archive className="w-3.5 h-3.5 text-zinc-400" />;
    return <File className="w-3.5 h-3.5 text-zinc-400" />;
  };

  return (
    <tr className="hover:bg-zinc-800/50 border-b border-zinc-800/80 text-xs transition-colors">
      {/* File Name */}
      <td className="py-2.5 px-3">
        <div className="flex items-center space-x-2">
          <span className="shrink-0">{getFileIcon(file.contentType)}</span>
          <button
            onClick={() => onViewDetails(file)}
            className="font-medium text-zinc-100 hover:underline text-left truncate max-w-[220px]"
            title={file.fileName}
          >
            {file.fileName || 'Untitled'}
          </button>
        </div>
      </td>

      {/* Size */}
      <td className="py-2.5 px-3 font-mono text-zinc-400">
        {formatSize(file.size)}
      </td>

      {/* Primary Node */}
      <td className="py-2.5 px-3 font-mono">
        <span className="text-zinc-100 font-semibold">{file.primaryNodeId || 'N/A'}</span>
        {file.primaryNodePort && (
          <span className="text-[10px] text-zinc-500 block font-mono">
            :{file.primaryNodePort}
          </span>
        )}
      </td>

      {/* Replica Node */}
      <td className="py-2.5 px-3 font-mono">
        {file.replicaNodeId ? (
          <div>
            <span className="text-zinc-100 font-semibold">{file.replicaNodeId}</span>
            {file.replicaNodePort && (
              <span className="text-[10px] text-zinc-500 block font-mono">
                :{file.replicaNodePort}
              </span>
            )}
          </div>
        ) : (
          <span className="text-amber-400 font-mono text-[11px]">Missing</span>
        )}
      </td>

      {/* Status Dot */}
      <td className="py-2.5 px-3">
        <NodeStatus status={statusLabel} />
      </td>

      {/* Created Date */}
      <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
        {formatDate(file.createdAt)}
      </td>

      {/* Actions Dropdown */}
      <td className="py-2.5 px-3 text-right relative">
        <div className="inline-block text-left" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Options"
          >
            {isDownloading || isDeleting || isRepairing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
            ) : (
              <MoreVertical className="w-3.5 h-3.5" />
            )}
          </button>

          {isMenuOpen && (
            <div className="origin-top-right absolute right-0 mt-1 w-36 rounded border border-zinc-800 bg-zinc-900 shadow-lg z-30 py-1 text-xs text-zinc-200">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDownload(file);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center space-x-2 text-zinc-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onViewDetails(file);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center space-x-2 text-zinc-300"
              >
                <Info className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>

              {statusLabel === 'Needs Repair' && onRepair && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRepair(file);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center space-x-2 text-amber-400"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Repair Replica</span>
                </button>
              )}

              <div className="border-t border-zinc-800 my-1" />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(file);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-950/60 flex items-center space-x-2 text-red-400 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
