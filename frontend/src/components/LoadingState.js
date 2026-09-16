import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading system data...' }) {
  return (
    <div className="py-12 flex items-center justify-center space-x-2 text-xs font-mono text-zinc-400">
      <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
      <span>{message}</span>
    </div>
  );
}
