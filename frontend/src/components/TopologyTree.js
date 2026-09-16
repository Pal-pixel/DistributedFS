import React from 'react';
import NodeStatus from './NodeStatus';

export default function TopologyTree({ nodes = [], coordinatorHost = 'localhost:5000' }) {
  return (
    <div className="p-4 rounded border border-zinc-200 bg-white">
      <div className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        System Topology
      </div>

      <div className="flex flex-col items-center py-2">
        {/* Coordinator Box */}
        <div className="px-4 py-2 rounded border border-zinc-900 bg-zinc-900 text-white text-center font-mono text-xs shadow-2xs">
          <div className="font-bold text-[11px] tracking-wide uppercase text-zinc-300">Coordinator</div>
          <div className="text-zinc-400 text-[10px]">{coordinatorHost}</div>
        </div>

        {/* Vertical Trunk Line */}
        <div className="w-px h-6 bg-zinc-300 my-0" />

        {/* Horizontal Connector Bar */}
        {nodes.length > 0 && (
          <div className="relative w-full max-w-xl flex flex-col items-center">
            {/* Top horizontal branch bar */}
            <div className="w-[80%] h-px bg-zinc-300" />

            {/* Nodes Row */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 relative">
              {nodes.map((node, i) => {
                const isOnline = node.status === 'ONLINE';
                return (
                  <div key={node.nodeId || i} className="flex flex-col items-center text-center relative">
                    {/* Vertical line connecting from top branch */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-zinc-300" />

                    <div className={`w-full p-2.5 rounded border text-xs transition-colors ${
                      isOnline ? 'border-zinc-200 bg-zinc-50' : 'border-red-200 bg-red-50/50'
                    }`}>
                      <div className="font-mono font-bold text-zinc-900 capitalize text-xs">
                        {node.nodeId}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 mt-0.5">
                        :{node.port}
                      </div>
                      <div className="mt-2 flex justify-center">
                        <NodeStatus status={node.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
