import React from 'react';
import Link from 'next/link';
import NodeStatus from './NodeStatus';
import { ArrowRight } from 'lucide-react';

export default function RecentFilesTable({ files = [], onViewDetails }) {
  const recent = files.slice(0, 5);

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="p-4 rounded border border-zinc-800 bg-zinc-900 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
          Recent Files
        </div>
        <Link
          href="/files"
          className="text-xs font-mono font-semibold text-zinc-300 hover:text-white inline-flex items-center space-x-1"
        >
          <span>View all files</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-6 text-center text-xs font-mono text-zinc-500">
          No files currently stored in cluster.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500">
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Size</th>
                <th className="py-2 px-2">Primary</th>
                <th className="py-2 px-2">Replica</th>
                <th className="py-2 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {recent.map((file) => (
                <tr
                  key={file.fileId || Math.random()}
                  onClick={() => onViewDetails && onViewDetails(file)}
                  className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-2 font-medium text-zinc-100 truncate max-w-[180px]">
                    {file.fileName}
                  </td>
                  <td className="py-2 px-2 text-zinc-400">
                    {formatSize(file.size)}
                  </td>
                  <td className="py-2 px-2 capitalize font-semibold text-zinc-200">
                    {file.primaryNodeId || 'N/A'}
                  </td>
                  <td className="py-2 px-2 capitalize text-zinc-300">
                    {file.replicaNodeId || 'N/A'}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <NodeStatus status={file.replicaNodeId ? 'Healthy' : 'Needs Repair'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
