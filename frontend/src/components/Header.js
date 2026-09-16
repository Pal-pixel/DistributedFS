'use client';

import React from 'react';
import { RefreshCw, Menu } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  onOpenSidebar,
  systemStatus = 'ONLINE',
}) {
  const isOnline = systemStatus === 'ONLINE' || systemStatus === 'HEALTHY';

  return (
    <header className="h-14 bg-zinc-950/90 backdrop-blur-xs border-b border-zinc-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 rounded text-zinc-400 hover:bg-zinc-800 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-baseline space-x-3">
          <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <span className="text-xs text-zinc-500 hidden md:inline">
              — {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right Section: System Indicator & Refresh */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-zinc-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>System {isOnline ? 'ONLINE' : 'DEGRADED'}</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 px-2.5 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
