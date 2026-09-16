import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to load storage data.',
  message = 'Check that the coordinator backend is running at http://localhost:5000.',
  onRetry,
}) {
  return (
    <div className="p-4 rounded border border-red-900/60 bg-red-950/40 text-xs text-red-400 space-y-2">
      <div className="flex items-center space-x-2 font-bold font-mono">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <span>{title}</span>
      </div>
      <div className="text-[11px] text-red-300">{message}</div>
      {onRetry && (
        <div>
          <button
            onClick={onRetry}
            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium inline-flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
}
