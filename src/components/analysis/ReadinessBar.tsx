import React from 'react';
import { FileCheck } from 'lucide-react';

interface ReadinessBarProps {
  score: number;
}

export const ReadinessBar: React.FC<ReadinessBarProps> = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getGradient = () => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 50) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-amber-500';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Evidence Readiness
        </span>
        <FileCheck className="w-5 h-5 text-brand-500" />
      </div>

      <div className="mt-4 flex items-baseline space-x-1">
        <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor()}`}>
          {score}%
        </span>
        <span className="text-xs font-semibold text-slate-400">Ready</span>
      </div>

      <div className="mt-4 h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {score >= 80
          ? 'Strong evidence foundation. Case is well-supported for formal filing.'
          : score >= 50
          ? 'Fair readiness. Gathering missing items will significantly improve outcomes.'
          : 'Low evidence readiness. Complete missing document steps first.'}
      </p>
    </div>
  );
};
