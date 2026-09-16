const SESSION_ACTIVITY_KEY = 'distributedfs_session_activity';

/**
 * Get current session activities from localStorage
 */
export const getSessionActivities = () => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SESSION_ACTIVITY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse session activity log:', error);
    return [];
  }
};

/**
 * Log a new activity item
 * @param {string} type - Action type e.g. 'upload', 'download', 'delete', 'health_check', 'repair', 'node_recovery', 'node_offline'
 * @param {string} title - Short description of action
 * @param {string} details - Additional contextual info
 */
export const logActivity = (type, title, details = '') => {
  if (typeof window === 'undefined') return;
  try {
    const current = getSessionActivities();
    const newActivity = {
      id: Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      type,
      title,
      details,
      timestamp: new Date().toISOString(),
    };
    const updated = [newActivity, ...current].slice(0, 100); // Keep last 100 entries
    localStorage.setItem(SESSION_ACTIVITY_KEY, JSON.stringify(updated));
    
    // Dispatch custom event so components can reactively update
    window.dispatchEvent(new CustomEvent('distributedfs_activity_logged', { detail: newActivity }));
    return newActivity;
  } catch (error) {
    console.error('Failed to log session activity:', error);
  }
};

/**
 * Clear session activity log
 */
export const clearSessionActivities = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_ACTIVITY_KEY);
    window.dispatchEvent(new CustomEvent('distributedfs_activity_cleared'));
  } catch (error) {
    console.error('Failed to clear session activity:', error);
  }
};
