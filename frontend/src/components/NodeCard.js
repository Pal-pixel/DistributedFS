import React from 'react';
import NodeStatus from './NodeStatus';
import { Server, Folder, Clock, Cpu, HardDrive } from 'lucide-react';

export default function NodeCard({ node, onInspect }) {
  const isOnline = node.status === 'ONLINE';

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Node Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {node.nodeId || 'Unknown Node'}
              </h3>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {node.host || 'localhost'}:{node.port || 'N/A'}
              </span>
            </div>
          </div>
          <NodeStatus status={node.status} />
        </div>

        {/* Node Details Grid */}
        <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
          {/* Storage Directory */}
          <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
              <Folder className="w-3.5 h-3.5" />
              <span>Storage Directory:</span>
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[160px]" title={node.storageDirectory}>
              {node.storageDirectory || 'N/A'}
            </span>
          </div>

          {/* Used Storage / Metric */}
          <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Storage Used:</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {node.usedStorage !== undefined ? node.usedStorage : 'N/A'}
            </span>
          </div>

          {/* Load Metric */}
          <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Node Load:</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {node.load !== undefined ? node.load : 'N/A'}
            </span>
          </div>

          {/* Last Checked */}
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Checked:</span>
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {formatDate(node.lastCheckedAt || node.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {onInspect && (
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onInspect(node)}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            View Details
          </button>
        </div>
      )}
    </div>
  );
}
