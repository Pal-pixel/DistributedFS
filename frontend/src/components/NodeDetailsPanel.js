import React from 'react';
import NodeDrawer from './NodeDrawer';

export default function NodeDetailsPanel({ node, isOpen, onClose }) {
  return <NodeDrawer node={node} isOpen={isOpen} onClose={onClose} />;
}
