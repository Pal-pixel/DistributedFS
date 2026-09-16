import React from 'react';
import { Loader2, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-12 px-4 border-b border-zinc-800 bg-[#121215] flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            {title}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-zinc-300">
          <p className="leading-relaxed">{message}</p>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-1.5 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center space-x-1.5 ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-zinc-100 hover:bg-white text-zinc-950'
              } disabled:opacity-50`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isLoading ? 'Processing...' : confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
