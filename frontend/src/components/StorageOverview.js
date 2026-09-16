import React from 'react';
import NodeStatus from './NodeStatus';
import { Network, Server, ArrowDownRight, ArrowRight, ShieldCheck, Database } from 'lucide-react';

export default function StorageOverview({ nodes = [], filesCount = 0 }) {
  const healthyCount = nodes.filter((n) => n.status === 'ONLINE').length;

  return (
    <div className="space-y-6">
      {/* 1. Coordinator & Node Topology Graph */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Network className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Distributed Architecture Topology</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live coordinator load balancing & replication routing topology
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Replication Factor: 2x
          </span>
        </div>

        {/* Topology Diagram Container */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 py-4">
          {/* Coordinator Card */}
          <div className="w-full md:w-64 p-4 rounded-xl bg-slate-900 text-white shadow-md flex flex-col justify-between shrink-0 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">
                  Coordinator Node
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-base font-bold tracking-tight">Express Coordinator</h4>
              <p className="font-mono text-xs text-slate-400 mt-1">http://localhost:5000</p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Managed Files</span>
              <span className="font-bold text-white">{filesCount}</span>
            </div>
          </div>

          {/* Connection Lines (Desktop / Mobile) */}
          <div className="hidden md:flex flex-col justify-center items-center px-2">
            <ArrowRight className="w-6 h-6 text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase">Load Balanced</span>
          </div>
          <div className="flex md:hidden justify-center py-1">
            <ArrowDownRight className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>

          {/* Storage Nodes Cluster List */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nodes.length > 0 ? (
              nodes.map((node) => {
                const isOnline = node.status === 'ONLINE';
                return (
                  <div
                    key={node.nodeId}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isOnline
                        ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white capitalize">
                        {node.nodeId}
                      </span>
                      <NodeStatus status={node.status} size="sm" />
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      Port: {node.port || 'N/A'}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span>Files Stored:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {node.fileCount !== undefined ? node.fileCount : 'N/A'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                No active storage nodes detected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Storage Distribution Bars */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Storage Distribution Across Nodes</span>
        </h3>

        <div className="space-y-4">
          {nodes.map((node, index) => {
            const isOnline = node.status === 'ONLINE';
            return (
              <div key={node.nodeId || index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="capitalize">{node.nodeId}</span>
                    <span className="font-mono text-slate-400 font-normal">
                      (Port {node.port})
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {node.usedStorage ? node.usedStorage : 'N/A'}
                    </span>
                    <NodeStatus status={node.status} size="sm" />
                  </div>
                </div>

                {/* Usage Visualization Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOnline ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-rose-500'
                    }`}
                    style={{
                      width: isOnline ? '65%' : '15%',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
