import React from 'react';
import { Trash } from 'lucide-react';

export default function ActivityStream({ activities = [], onClear }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-500">
        No session events logged.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
      <div className="h-10 px-3 bg-[#121215] border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-mono font-bold uppercase text-zinc-300">
          Session Activity Stream
        </span>
        {onClear && (
          <button
            onClick={onClear}
            className="text-[11px] font-mono text-zinc-500 hover:text-red-400 flex items-center space-x-1"
          >
            <Trash className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="divide-y divide-zinc-800/80 text-xs font-mono">
        {activities.map((item) => (
          <div key={item.id} className="py-2 px-3 flex items-center justify-between hover:bg-zinc-800/40">
            <div className="flex items-center space-x-3 truncate">
              <span className="text-zinc-500 text-[11px] shrink-0">
                {formatTime(item.timestamp)}
              </span>
              <span className="font-semibold text-zinc-200 shrink-0">
                {item.title}
              </span>
              {item.details && (
                <span className="text-zinc-400 truncate text-[11px]">
                  {item.details}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
