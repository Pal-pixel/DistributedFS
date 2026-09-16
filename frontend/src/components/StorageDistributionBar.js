import React from 'react';
import NodeStatus from './NodeStatus';

export default function StorageDistributionBar({ nodes = [] }) {
  return (
    <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
      <div className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Storage Distribution
      </div>

      <div className="space-y-3">
        {nodes.map((node) => {
          const isOnline = node.status === 'ONLINE';
          return (
            <div key={node.nodeId} className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-zinc-100 capitalize">{node.nodeId}</span>
                  <span className="text-zinc-500 text-[10px]">(:{node.port})</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-zinc-400 text-[11px]">
                    {node.usedStorage !== undefined ? node.usedStorage : 'N/A'}
                  </span>
                  <NodeStatus status={node.status} />
                </div>
              </div>

              {/* Usage visualization bar */}
              <div className="w-full h-1.5 rounded bg-zinc-800 overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOnline ? 'bg-zinc-200' : 'bg-red-500'
                  }`}
                  style={{ width: isOnline ? '60%' : '10%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
