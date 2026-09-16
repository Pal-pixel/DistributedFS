import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Fetch all files metadata
 */
export const getFiles = async () => {
  const response = await apiClient.get('/files');
  return response.data;
};

/**
 * Fetch single file metadata by ID
 */
export const getFile = async (id) => {
  const response = await apiClient.get(`/files/${id}`);
  return response.data;
};

/**
 * Upload file to coordinator (multipart/form-data)
 */
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

/**
 * Download file by ID (handles blob creation & browser save)
 */
export const downloadFile = async (id, fallbackFileName = 'download') => {
  const response = await apiClient.get(`/files/${id}/download`, {
    responseType: 'blob',
  });

  // Extract filename from content-disposition header if present
  let filename = fallbackFileName;
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  // Create blob URL and trigger download in browser
  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);

  return { success: true, filename };
};

/**
 * Delete file and its replicas by ID
 */
export const deleteFile = async (id) => {
  const response = await apiClient.delete(`/files/${id}`);
  return response.data;
};

/**
 * Get all registered storage nodes
 */
export const getNodes = async () => {
  const response = await apiClient.get('/nodes');
  return response.data;
};

/**
 * Get currently healthy storage nodes
 */
export const getHealthyNodes = async () => {
  const response = await apiClient.get('/nodes/healthy');
  return response.data;
};

/**
 * Check node health & status changes
 */
export const getNodeStatus = async () => {
  const response = await apiClient.get('/nodes/status');
  return response.data;
};

/**
 * Trigger manual replication repair for all files
 */
export const repairReplication = async () => {
  const response = await apiClient.post('/nodes/repair');
  return response.data;
};

/**
 * Trigger manual replication repair for a specific file
 */
export const repairFileReplication = async (fileId) => {
  const response = await apiClient.post(`/files/${fileId}/repair-replication`);
  return response.data;
};

export default apiClient;
