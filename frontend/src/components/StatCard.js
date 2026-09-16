import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  trend,
  className = '',
}) {
  return (
    <div className={`p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value !== undefined && value !== null ? value : 'N/A'}
        </span>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-2 flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
          {trend === 'up' && (
            <span className="mr-1 text-emerald-600 dark:text-emerald-400 font-bold">↑</span>
          )}
          {trend === 'down' && (
            <span className="mr-1 text-rose-600 dark:text-rose-400 font-bold">↓</span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
