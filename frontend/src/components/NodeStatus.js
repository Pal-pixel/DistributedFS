import React from 'react';

export default function NodeStatus({ status }) {
  const norm = (status || 'UNKNOWN').toUpperCase();

  let dotColor = 'bg-zinc-500';
  let textColor = 'text-zinc-400';
  let label = status || 'Incomplete';

  if (norm === 'ONLINE' || norm === 'HEALTHY') {
    dotColor = 'bg-emerald-500';
    textColor = 'text-emerald-400';
    label = status || 'ONLINE';
  } else if (norm === 'OFFLINE' || norm === 'NODE OFFLINE') {
    dotColor = 'bg-red-500';
    textColor = 'text-red-400';
    label = status || 'OFFLINE';
  } else if (norm === 'NEEDS REPAIR' || norm === 'DEGRADED') {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-400';
    label = status || 'Needs Repair';
  } else if (norm === 'RECOVERED') {
    dotColor = 'bg-indigo-400';
    textColor = 'text-indigo-400';
    label = 'RECOVERED';
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 font-mono text-[11px] font-medium ${textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
