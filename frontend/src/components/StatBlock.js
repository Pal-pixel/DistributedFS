import React from 'react';

export default function StatBlock({ label, value, subtext }) {
  return (
    <div className="p-3 rounded border border-zinc-800 bg-zinc-900">
      <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span className="text-lg font-bold font-mono text-zinc-100 tracking-tight">
          {value !== undefined && value !== null ? value : 'N/A'}
        </span>
        {subtext && (
          <span className="text-[10px] font-mono text-zinc-500">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
