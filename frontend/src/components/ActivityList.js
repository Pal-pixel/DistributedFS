import React from 'react';
import ActivityStream from './ActivityStream';

export default function ActivityList({ activities = [], onClear }) {
  return <ActivityStream activities={activities} onClear={onClear} />;
}
