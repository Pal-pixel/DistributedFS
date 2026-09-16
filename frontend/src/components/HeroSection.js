'use client';

import React from 'react';
import Link from 'next/link';
import LiveArchitectureGraph from './LiveArchitectureGraph';
import { Upload, Server, ArrowRight } from 'lucide-react';

export default function HeroSection({ nodes = [], sampleFile, onOpenUpload }) {
  return (
    <section className="relative rounded-md border border-zinc-800 bg-zinc-900 bg-tech-grid p-6 sm:p-8 lg:p-10 shadow-2xs overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Technical Copy & CTAs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Category Tag */}
          <div className="inline-flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-zinc-400">
              Distributed Storage System
            </span>
          </div>

          {/* Strong Two-Line Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight leading-[1.1]">
            Store once.
            <br />
            <span className="text-zinc-400">Stay available.</span>
          </h1>

          {/* Technical Description */}
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
            DistributedFS intelligently distributes files across multiple storage nodes with replication, health monitoring, and automatic recovery.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="h-10 px-4 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold inline-flex items-center space-x-2 shadow-2xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            <Link
              href="/nodes"
              className="h-10 px-4 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold inline-flex items-center space-x-2 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-zinc-400" />
              <span>Explore Nodes</span>
              <ArrowRight className="w-3 h-3 text-zinc-500" />
            </Link>
          </div>
        </div>

        {/* Right Column: Live Architecture Centerpiece */}
        <div className="lg:col-span-5 w-full">
          <LiveArchitectureGraph nodes={nodes} sampleFile={sampleFile} />
        </div>
      </div>
    </section>
  );
}
