import React from 'react';
import FileDetailsDrawer from './FileDetailsDrawer';

export default function FileDetailsPanel({ file, isOpen, onClose }) {
  return <FileDetailsDrawer file={file} isOpen={isOpen} onClose={onClose} />;
}
