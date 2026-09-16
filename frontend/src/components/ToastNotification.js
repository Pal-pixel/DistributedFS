import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ToastNotification({ notifications = [], onDismiss }) {
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        if (onDismiss && notifications[0]) {
          onDismiss(notifications[0].id);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`p-3 rounded border shadow-sm text-xs flex items-start justify-between bg-white ${
            item.type === 'recovery' ? 'border-zinc-300 text-zinc-900' : 'border-red-300 text-red-700'
          }`}
        >
          <div className="flex items-start space-x-2">
            {item.type === 'recovery' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold font-mono">{item.title}</div>
              <div className="text-[11px] mt-0.5 text-zinc-600">{item.message}</div>
            </div>
          </div>
          <button
            onClick={() => onDismiss(item.id)}
            className="text-zinc-400 hover:text-zinc-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
