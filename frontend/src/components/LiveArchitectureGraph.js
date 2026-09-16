'use client';

import React from 'react';
import NodeStatus from './NodeStatus';
import { Server, HardDrive, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LiveArchitectureGraph({ nodes = [], sampleFile }) {
  const nodeSlots = [
    { nodeId: 'node-1', port: 5001, status: 'ONLINE' },
    { nodeId: 'node-2', port: 5002, status: 'ONLINE' },
    { nodeId: 'node-3', port: 5003, status: 'ONLINE' },
  ].map((slot) => {
    const live = nodes.find((n) => n.nodeId === slot.nodeId);
    return live || slot;
  });

  const samplePrimary = sampleFile?.primaryNodeId || 'node-2';
  const sampleReplica = sampleFile?.replicaNodeId || 'node-3';
  const sampleName = sampleFile?.fileName || 'report.pdf';

  return (
    <div className="w-full p-5 rounded border border-zinc-800 bg-zinc-950/80 shadow-2xs relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-5">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-node-pulse" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            Cluster Architecture & Topology
          </span>
        </div>
        <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          2× Redundancy
        </span>
      </div>

      {/* Main Architecture Flow Diagram */}
      <div className="flex flex-col items-center py-2">
        {/* Coordinator Node Box */}
        <div className="w-48 p-2.5 rounded border border-zinc-700 bg-zinc-900 text-white text-center font-mono shadow-2xs z-10 relative">
          <div className="flex items-center justify-center space-x-1.5 mb-0.5">
            <HardDrive className="w-3.5 h-3.5 text-zinc-300" />
            <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-100">
              Coordinator
            </span>
          </div>
          <div className="text-[10px] text-zinc-400">localhost:5000</div>
        </div>

        {/* Dynamic Animated Line Connector SVG */}
        <div className="w-full max-w-md h-12 relative my-1">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 48">
            <line x1="200" y1="0" x2="200" y2="20" stroke="#3F3F46" strokeWidth="1.5" />
            <line x1="60" y1="20" x2="340" y2="20" stroke="#3F3F46" strokeWidth="1.5" />
            <line x1="60" y1="20" x2="60" y2="48" stroke="#3F3F46" strokeWidth="1.5" />
            <line x1="200" y1="20" x2="200" y2="48" stroke="#3F3F46" strokeWidth="1.5" />
            <line x1="340" y1="20" x2="340" y2="48" stroke="#3F3F46" strokeWidth="1.5" />

            {/* Subtle Animated Data Signal Dots */}
            {nodeSlots[0].status === 'ONLINE' && (
              <circle r="3" fill="#22C55E" className="animate-pulse">
                <animateMotion path="M 200,0 L 200,20 L 60,20 L 60,48" dur="3s" repeatCount="indefinite" />
              </circle>
            )}
            {nodeSlots[1].status === 'ONLINE' && (
              <circle r="3" fill="#22C55E" className="animate-pulse">
                <animateMotion path="M 200,0 L 200,48" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
            {nodeSlots[2].status === 'ONLINE' && (
              <circle r="3" fill="#22C55E" className="animate-pulse">
                <animateMotion path="M 200,0 L 200,20 L 340,20 L 340,48" dur="3.2s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        </div>

        {/* Nodes Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5 pt-1">
          {nodeSlots.map((node) => {
            const isOnline = node.status === 'ONLINE';
            return (
              <div
                key={node.nodeId}
                className={`p-2.5 rounded border text-center font-mono transition-all ${
                  isOnline
                    ? 'border-zinc-800 bg-zinc-900/90 hover:bg-zinc-900'
                    : 'border-red-900/60 bg-red-950/40 text-red-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Server className={`w-3 h-3 ${isOnline ? 'text-zinc-300' : 'text-red-400'}`} />
                  <span className="font-bold text-xs uppercase text-zinc-100">
                    {node.nodeId}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 mb-1.5">
                  :{node.port}
                </div>
                <div className="flex justify-center">
                  <NodeStatus status={node.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary / Replica Replication Architecture Callout */}
      <div className="mt-5 pt-3 border-t border-zinc-800 bg-zinc-900/40 -mx-5 -mb-5 p-3.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-zinc-200 text-[11px] truncate max-w-[130px]">
            {sampleName}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold capitalize">
            Primary: {samplePrimary}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold capitalize">
            Replica: {sampleReplica}
          </span>
        </div>
      </div>
    </div>
  );
}
