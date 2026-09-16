import React from 'react';
import NodeStatus from './NodeStatus';

export default function NodeTable({ nodes = [], onSelectNode }) {
  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
      if (seconds < 60) return `${seconds} sec ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="py-8 text-center bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 font-mono">
        No registered storage nodes found.
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#121215] border-b border-zinc-800 font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Node</th>
              <th className="py-2.5 px-3">Address</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Files</th>
              <th className="py-2.5 px-3">Storage</th>
              <th className="py-2.5 px-3 text-right">Last Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 text-xs font-mono">
            {nodes.map((node) => {
              return (
                <tr
                  key={node.nodeId || Math.random()}
                  onClick={() => onSelectNode && onSelectNode(node)}
                  className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-zinc-100 capitalize">
                    {node.nodeId}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400">
                    {node.host || 'localhost'}:{node.port}
                  </td>
                  <td className="py-2.5 px-3">
                    <NodeStatus status={node.status} />
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">
                    {node.fileCount !== undefined ? node.fileCount : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">
                    {node.usedStorage !== undefined ? node.usedStorage : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-400 text-[11px]">
                    {formatTime(node.lastCheckedAt || node.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
