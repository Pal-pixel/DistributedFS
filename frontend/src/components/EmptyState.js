import React from 'react';

export default function EmptyState({
  title = 'No files',
  description = 'Upload a file to get started.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center rounded border border-dashed border-zinc-800 bg-zinc-900/50">
      <div className="text-xs font-bold text-zinc-200">{title}</div>
      <div className="text-xs text-zinc-400 mt-0.5 max-w-xs">{description}</div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
