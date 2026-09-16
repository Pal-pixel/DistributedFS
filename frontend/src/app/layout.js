'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getNodeStatus } from '@/lib/api';
import './globals.css';

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState('ONLINE');

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await getNodeStatus();
        if (isMounted && res && res.nodes) {
          const healthyNodes = res.nodes.filter((n) => n.status === 'ONLINE');
          setSystemStatus(healthyNodes.length > 0 ? 'ONLINE' : 'DEGRADED');
        }
      } catch (err) {
        if (isMounted) setSystemStatus('DEGRADED');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <html lang="en" className="dark h-full">
      <head>
        <title>DistributedFS - Distributed File System Console</title>
        <meta
          name="description"
          content="Production-grade dark management dashboard for DistributedFS cluster"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-full bg-zinc-950 text-zinc-100 flex flex-col antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* Dark Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            systemStatus={systemStatus}
          />

          {/* Main Layout Container */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-[230px]">
            <main className="flex-1 overflow-y-auto bg-zinc-950">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
