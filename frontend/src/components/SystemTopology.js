import React from 'react';
import NodeStatus from './NodeStatus';

export default function SystemTopology({ nodes = [], coordinatorHost = 'localhost:5000' }) {
  const nodeSlots = [
    { nodeId: 'node-1', port: 5001, status: 'ONLINE' },
    { nodeId: 'node-2', port: 5002, status: 'ONLINE' },
    { nodeId: 'node-3', port: 5003, status: 'ONLINE' },
  ].map((slot) => {
    const live = nodes.find((n) => n.nodeId === slot.nodeId);
    return live || slot;
  });

  return (
    <div className="p-4 rounded border border-zinc-200 bg-white">
      <div className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Storage Topology
      </div>

      <div className="flex flex-col items-center py-2">
        {/* Coordinator Box */}
        <div className="px-4 py-2 rounded border border-zinc-900 bg-zinc-900 text-white text-center font-mono text-xs shadow-2xs">
          <div className="font-bold text-[11px] uppercase tracking-wider text-zinc-300">Coordinator</div>
          <div className="text-zinc-400 text-[10px]">{coordinatorHost}</div>
        </div>

        {/* Dynamic Topology Connector SVG */}
        <div className="w-full max-w-md h-12 relative my-1">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 48">
            <line x1="200" y1="0" x2="200" y2="20" stroke="#D4D4D8" strokeWidth="1.5" />
            <line x1="60" y1="20" x2="340" y2="20" stroke="#D4D4D8" strokeWidth="1.5" />
            <line x1="60" y1="20" x2="60" y2="48" stroke="#D4D4D8" strokeWidth="1.5" />
            <line x1="200" y1="20" x2="200" y2="48" stroke="#D4D4D8" strokeWidth="1.5" />
            <line x1="340" y1="20" x2="340" y2="48" stroke="#D4D4D8" strokeWidth="1.5" />

            {/* Subtle animated signal dots */}
            {nodeSlots[0].status === 'ONLINE' && (
              <circle r="3" fill="#16A34A" className="animate-pulse">
                <animateMotion path="M 200,0 L 200,20 L 60,20 L 60,48" dur="3s" repeatCount="indefinite" />
              </circle>
            )}
            {nodeSlots[1].status === 'ONLINE' && (
              <circle r="3" fill="#16A34A" className="animate-pulse">
                <animateMotion path="M 200,0 L 200,48" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
            {nodeSlots[2].status === 'ONLINE' && (
              <circle r="3" fill="#16A34A" className="animate-pulse">
                <animateMotion path="M 200,0 L 200,20 L 340,20 L 340,48" dur="3.2s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        </div>

        {/* Nodes Grid */}
        <div className="w-full grid grid-cols-3 gap-3 pt-1">
          {nodeSlots.map((node) => {
            const isOnline = node.status === 'ONLINE';
            return (
              <div
                key={node.nodeId}
                className={`p-2.5 rounded border text-center font-mono text-xs transition-colors ${
                  isOnline ? 'border-zinc-200 bg-zinc-50' : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <div className="font-bold text-zinc-900 uppercase text-xs">
                  {node.nodeId}
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
    </div>
  );
}
