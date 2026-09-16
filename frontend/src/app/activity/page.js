'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import ActivityStream from '@/components/ActivityStream';
import { getSessionActivities, clearSessionActivities } from '@/lib/activity';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);

  const loadActivities = useCallback(() => {
    setActivities(getSessionActivities());
  }, []);

  useEffect(() => {
    loadActivities();

    const handleActivityLogged = () => {
      loadActivities();
    };

    window.addEventListener('distributedfs_activity_logged', handleActivityLogged);
    window.addEventListener('distributedfs_activity_cleared', handleActivityLogged);

    return () => {
      window.removeEventListener('distributedfs_activity_logged', handleActivityLogged);
      window.removeEventListener('distributedfs_activity_cleared', handleActivityLogged);
    };
  }, [loadActivities]);

  const handleClear = () => {
    clearSessionActivities();
    loadActivities();
  };

  return (
    <div className="pb-8 bg-zinc-950 min-h-screen text-zinc-100">
      <Header
        title="Activity"
        subtitle="Session activity"
        onRefresh={loadActivities}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        <ActivityStream activities={activities} onClear={handleClear} />
      </div>
    </div>
  );
}
