import React from 'react';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { PriorityLevel } from '../../types';

interface PriorityGaugeProps {
  score: number;
  level: PriorityLevel;
}

export const PriorityGauge: React.FC<PriorityGaugeProps> = ({ score, level }) => {
  const badgeStyles = {
    low: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    medium: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    high: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
  };

  const progressColors = {
    low: 'from-emerald-500 to-teal-400',
    medium: 'from-amber-500 to-yellow-400',
    high: 'from-rose-600 to-orange-500',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Case Priority Score
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeStyles[level]}`}>
          {level} PRIORITY
        </span>
      </div>

      <div className="mt-4 flex items-baseline space-x-2">
        <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {score}
        </span>
        <span className="text-sm font-semibold text-slate-400">/ 100</span>
      </div>

      {/* Progress Track */}
      <div className="mt-4 h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${progressColors[level]} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {level === 'high'
          ? 'Elevated priority due to financial impact, safety concerns, or repeated resolution attempts.'
          : level === 'medium'
          ? 'Moderate priority. Follow recommended formal notice guidelines.'
          : 'Standard priority. Proceed through direct mediation steps.'}
      </p>
    </div>
  );
};
