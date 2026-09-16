'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import NodeTable from '@/components/NodeTable';
import NodeDrawer from '@/components/NodeDrawer';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { getNodes, getNodeStatus, repairReplication } from '@/lib/api';
import { logActivity } from '@/lib/activity';
import { RefreshCw, Wrench } from 'lucide-react';

export default function NodesPage() {
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [toasts, setToasts] = useState([]);
  const lastKnownStatusRef = useRef({});

  const [selectedNode, setSelectedNode] = useState(null);
  const [isRepairConfirmOpen, setIsRepairConfirmOpen] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState(null);

  const fetchNodeData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const statusRes = await getNodeStatus().catch(() => null);

      if (statusRes && statusRes.nodes) {
        setNodes(statusRes.nodes);

        const newToasts = [];

        if (statusRes.recoveredNodes && statusRes.recoveredNodes.length > 0) {
          statusRes.recoveredNodes.forEach((node) => {
            const key = `recovered-${node.nodeId}`;
            if (!lastKnownStatusRef.current[key]) {
              newToasts.push({
                id: key,
                type: 'success',
                title: 'Node recovered',
                message: `${node.nodeId} is back online on port ${node.port}.`,
              });
              logActivity('node_recovery', `Node recovered`, `${node.nodeId} back online`);
              lastKnownStatusRef.current[key] = true;
            }
          });
        }

        if (statusRes.offlineNodes && statusRes.offlineNodes.length > 0) {
          statusRes.offlineNodes.forEach((node) => {
            const key = `offline-${node.nodeId}`;
            if (!lastKnownStatusRef.current[key]) {
              newToasts.push({
                id: key,
                type: 'warning',
                title: 'Node offline',
                message: `${node.nodeId} is currently unavailable.`,
              });
              logActivity('node_offline', `Node offline`, `${node.nodeId} unreachable`);
              lastKnownStatusRef.current[key] = true;
            }
          });
        }

        if (newToasts.length > 0) {
          setToasts((prev) => [...newToasts, ...prev]);
        }
      } else {
        const nodesRes = await getNodes();
        setNodes(nodesRes.nodes || nodesRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch storage nodes:', err);
      setError('Unable to load storage nodes.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNodeData(true);
    const interval = setInterval(() => {
      fetchNodeData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNodeData]);

  const handleExecuteRepair = async () => {
    setIsRepairing(true);
    setRepairResult(null);

    try {
      const res = await repairReplication();
      setIsRepairConfirmOpen(false);

      const summary = {
        checked: res.checked || 0,
        repaired: res.repaired || 0,
        message: res.message || 'Replication repair completed',
      };

      setRepairResult(summary);
      logActivity(
        'repair',
        'Replication repair completed',
        `Checked: ${summary.checked}, Repaired: ${summary.repaired}`
      );

      fetchNodeData(false);
    } catch (err) {
      console.error('Repair execution error:', err);
      setRepairResult({
        checked: 0,
        repaired: 0,
        error: 'Replication repair failed.',
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="pb-8 bg-zinc-950 min-h-screen text-zinc-100">
      <Header
        title="Storage Nodes"
        subtitle="Monitor storage nodes & health"
        onRefresh={() => fetchNodeData(false)}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Toast Notifications */}
        <Toast toasts={toasts} onDismiss={handleDismissToast} />

        {/* Repair Result Banner */}
        {repairResult && (
          <div className="p-3 rounded border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs font-mono flex items-center justify-between">
            <div>
              {repairResult.error ? (
                <span className="text-red-400">{repairResult.error}</span>
              ) : (
                <span>
                  Replication repair completed — Checked: <strong>{repairResult.checked}</strong>, Repaired: <strong>{repairResult.repaired}</strong>
                </span>
              )}
            </div>
            <button onClick={() => setRepairResult(null)} className="underline text-zinc-400">Dismiss</button>
          </div>
        )}

        {/* Control Toolbar */}
        <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
          <div className="text-xs font-mono font-semibold uppercase text-zinc-400">
            Registered Infrastructure Nodes
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchNodeData(false)}
              disabled={isRefreshing}
              className="px-2.5 py-1.5 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium inline-flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsRepairConfirmOpen(true)}
              className="px-2.5 py-1.5 rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium inline-flex items-center space-x-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              <span>Repair Replication</span>
            </button>
          </div>
        </div>

        {/* Node Table */}
        {isLoading ? (
          <LoadingState message="Checking node health..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchNodeData(true)} />
        ) : (
          <NodeTable
            nodes={nodes}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        )}
      </div>

      {/* Replication Repair Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRepairConfirmOpen}
        onClose={() => setIsRepairConfirmOpen(false)}
        onConfirm={handleExecuteRepair}
        title="Run replication repair?"
        message="This will check distributed files and repair missing or invalid replicas."
        confirmLabel="Run Repair"
        isLoading={isRepairing}
      />

      {/* Node Details Side Panel Drawer */}
      <NodeDrawer
        node={selectedNode}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
