import React from 'react';
import NodeStatus from './NodeStatus';
import { X } from 'lucide-react';

export default function NodeDrawer({ node, isOpen, onClose }) {
  if (!isOpen || !node) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col text-zinc-100">
          <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between bg-[#121215]">
            <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-300">
              Node Details
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                Node ID
              </span>
              <span className="font-bold text-zinc-100 capitalize text-sm">
                {node.nodeId}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                Address
              </span>
              <span className="text-zinc-300">
                {node.host || 'localhost'}:{node.port}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                Status
              </span>
              <NodeStatus status={node.status} />
            </div>

            <div>
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                Storage Directory
              </span>
              <span className="text-zinc-200 break-all select-all text-[11px] block bg-zinc-950 p-2 rounded border border-zinc-800">
                {node.storageDirectory || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                Last Checked
              </span>
              <span className="text-zinc-400">
                {node.lastCheckedAt ? new Date(node.lastCheckedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-3 border-t border-zinc-800 bg-zinc-900 flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
