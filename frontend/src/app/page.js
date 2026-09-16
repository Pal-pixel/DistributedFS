'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import StatBlock from '@/components/StatBlock';
import StorageDistributionBar from '@/components/StorageDistributionBar';
import RecentFilesTable from '@/components/RecentFilesTable';
import FileDetailsDrawer from '@/components/FileDetailsDrawer';
import UploadModal from '@/components/UploadModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { getFiles, getNodes, getNodeStatus, repairReplication } from '@/lib/api';
import { logActivity } from '@/lib/activity';

export default function OverviewPage() {
  const [files, setFiles] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals & Drawers
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRepairConfirmOpen, setIsRepairConfirmOpen] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchOverviewData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const [filesRes, statusRes] = await Promise.all([
        getFiles().catch(() => ({ files: [] })),
        getNodeStatus().catch(() => ({ nodes: [] })),
      ]);

      setFiles(filesRes.files || filesRes.data || []);
      setNodes(statusRes.nodes || []);
    } catch (err) {
      console.error('Failed to load cluster overview:', err);
      setError('Could not connect to the DistributedFS coordinator at http://localhost:5000.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData(true);
  }, [fetchOverviewData]);

  const totalFiles = files.length;
  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter((n) => n.status === 'ONLINE').length;

  const handleRunRepair = async () => {
    setIsRepairing(true);
    try {
      const res = await repairReplication();
      setIsRepairConfirmOpen(false);
      logActivity('repair', 'Replication repair completed', `${res.checked || 0} files checked, ${res.repaired || 0} repaired`);
      setToastMessage(`Replication repair completed: ${res.repaired || 0} files repaired.`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchOverviewData();
    } catch (err) {
      console.error('Repair failed:', err);
      setToastMessage('Replication repair failed.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="pb-10 bg-zinc-950 min-h-screen text-zinc-100">
      <Header
        title="Overview"
        subtitle="Distributed storage system"
        onRefresh={() => fetchOverviewData(false)}
        isRefreshing={isRefreshing}
        systemStatus={onlineNodes === totalNodes && totalNodes > 0 ? 'ONLINE' : 'DEGRADED'}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Banner Toast */}
        {toastMessage && (
          <div className="p-3 rounded border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs font-mono flex items-center justify-between">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="underline text-zinc-400">Dismiss</button>
          </div>
        )}

        {isLoading ? (
          <LoadingState message="Fetching storage cluster status..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchOverviewData(true)} />
        ) : (
          <>
            {/* 1. Dynamic Dark Engineering Hero Section */}
            <HeroSection
              nodes={nodes}
              sampleFile={files[0]}
              onOpenUpload={() => setIsUploadOpen(true)}
            />

            {/* 2. System Overview Metrics */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-zinc-400 uppercase">
                System Overview
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBlock label="FILES" value={totalFiles} subtext="Replicated" />
                <StatBlock label="STORAGE NODES" value={totalNodes} subtext="Cluster" />
                <StatBlock label="ONLINE" value={onlineNodes} subtext={`${onlineNodes}/${totalNodes} Active`} />
                <StatBlock label="REPLICATION" value="2×" subtext="Primary + Replica" />
              </div>
            </div>

            {/* 3. Storage Distribution Bar */}
            <StorageDistributionBar nodes={nodes} />

            {/* 4. Recent Files Snippet Table */}
            <RecentFilesTable
              files={files}
              onViewDetails={(file) => setSelectedFile(file)}
            />
          </>
        )}
      </div>

      {/* File Details Side Panel Drawer */}
      <FileDetailsDrawer
        file={selectedFile}
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => fetchOverviewData(false)}
      />

      {/* Repair Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRepairConfirmOpen}
        onClose={() => setIsRepairConfirmOpen(false)}
        onConfirm={handleRunRepair}
        title="Run Replication Repair?"
        message="This will check distributed files and repair missing or invalid replicas across storage nodes."
        confirmLabel="Run Repair"
        isLoading={isRepairing}
      />
    </div>
  );
}
