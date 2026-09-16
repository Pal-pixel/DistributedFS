'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Files,
  Server,
  Activity,
  HardDrive,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, systemStatus = 'ONLINE' }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Files', href: '/files', icon: Files },
    { label: 'Storage Nodes', href: '/nodes', icon: Server },
    { label: 'Activity', href: '/activity', icon: Activity },
  ];

  const isOnline = systemStatus === 'ONLINE' || systemStatus === 'HEALTHY';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Dark Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[230px] bg-[#121215] border-r border-zinc-800 text-zinc-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800">
          <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
            <div className="w-5 h-5 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center shrink-0">
              <HardDrive className="w-3 h-3" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              DistributedFS
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Coordinator Footer Panel */}
        <div className="p-3 border-t border-zinc-800 bg-[#0c0c0e]">
          <div className="text-[11px]">
            <div className="flex items-center justify-between text-zinc-400 font-medium">
              <span>Coordinator</span>
              <span className="flex items-center space-x-1 font-mono text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={isOnline ? 'text-zinc-200' : 'text-amber-400'}>
                  {isOnline ? 'ONLINE' : 'DEGRADED'}
                </span>
              </span>
            </div>
            <div className="font-mono text-zinc-500 mt-0.5 text-[10px]">
              localhost:5000
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
