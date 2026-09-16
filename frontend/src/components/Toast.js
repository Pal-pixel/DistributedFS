import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        if (onDismiss && toasts[0]) {
          onDismiss(toasts[0].id);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let borderStyle = 'border-zinc-800 bg-zinc-900 text-zinc-100';
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;

        if (toast.type === 'error') {
          borderStyle = 'border-red-900/80 bg-red-950/90 text-red-200';
          icon = <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
        } else if (toast.type === 'warning' || toast.type === 'offline') {
          borderStyle = 'border-amber-900/80 bg-amber-950/90 text-amber-200';
          icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
        } else if (toast.type === 'info') {
          borderStyle = 'border-zinc-800 bg-zinc-900 text-zinc-100';
          icon = <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            className={`p-3 rounded border shadow-lg text-xs flex items-start justify-between ${borderStyle} transition-all animate-in fade-in`}
          >
            <div className="flex items-start space-x-2.5">
              {icon}
              <div>
                {toast.title && <div className="font-bold font-mono text-[11px]">{toast.title}</div>}
                <div className="text-[11px] font-mono leading-tight">{toast.message || toast.text}</div>
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-500 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
