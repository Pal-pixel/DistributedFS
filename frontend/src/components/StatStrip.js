import React from 'react';

export default function StatStrip({ totalFiles = 0, totalNodes = 0, onlineNodes = 0, replicationFactor = '2×' }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
        System Overview
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded border border-zinc-800 bg-zinc-900">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
            FILES
          </div>
          <div className="mt-1 font-mono font-bold text-lg text-zinc-100">
            {totalFiles}
          </div>
        </div>

        <div className="p-3 rounded border border-zinc-800 bg-zinc-900">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
            STORAGE NODES
          </div>
          <div className="mt-1 font-mono font-bold text-lg text-zinc-100">
            {totalNodes}
          </div>
        </div>

        <div className="p-3 rounded border border-zinc-800 bg-zinc-900">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
            ONLINE
          </div>
          <div className="mt-1 font-mono font-bold text-lg text-zinc-100">
            {onlineNodes} / {totalNodes}
          </div>
        </div>

        <div className="p-3 rounded border border-zinc-800 bg-zinc-900">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
            REPLICATION
          </div>
          <div className="mt-1 font-mono font-bold text-lg text-zinc-100">
            {replicationFactor}
          </div>
        </div>
      </div>
    </div>
  );
}
