import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, FileText, ArrowRight, Bookmark } from 'lucide-react';
import { caseService } from '../services/caseService';
import { CivicCase } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const ActionCenter: React.FC = () => {
  const { t } = useLanguage();
  const [cases, setCases] = useState<CivicCase[]>([]);

  useEffect(() => {
    setCases(caseService.getCases());
  }, []);

  const urgentActions = cases.filter(c => c.analysis.priorityLevel === 'high' && c.status === 'active');
  const todayActions = cases.filter(c => c.analysis.priorityLevel === 'medium' && c.status === 'active');
  const upcomingActions = cases.filter(c => c.analysis.priorityLevel === 'low' && c.status === 'active');
  const completedCases = cases.filter(c => c.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Central Civic Action Center
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Aggregated next action steps across your active rights cases, RTI applications, and scheme readiness tasks.
        </p>
      </div>

      {/* URGENT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-extrabold text-sm uppercase tracking-wider">
          <AlertTriangle className="w-5 h-5" />
          <span>URGENT ACTIONS ({urgentActions.length})</span>
        </div>

        {urgentActions.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No urgent high-priority actions pending right now.
          </div>
        ) : (
          <div className="space-y-3">
            {urgentActions.map(c => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                      HIGH PRIORITY ({c.analysis.priorityScore}/100)
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{c.category.toUpperCase()}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{c.title}</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">Next Action: </span>
                    {c.analysis.nextBestAction}
                  </p>
                </div>

                <a
                  href={`/cases/${c.id}/analysis`}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shrink-0 flex items-center space-x-1"
                >
                  <span>Execute Action</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODAY SECTION */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm uppercase tracking-wider">
          <Clock className="w-5 h-5" />
          <span>RECOMMENDED TODAY ({todayActions.length})</span>
        </div>

        {todayActions.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No medium priority actions scheduled for today.
          </div>
        ) : (
          <div className="space-y-3">
            {todayActions.map(c => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                    MEDIUM PRIORITY ({c.analysis.priorityScore}/100)
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{c.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Next Action: </span>
                    {c.analysis.nextBestAction}
                  </p>
                </div>

                <a
                  href={`/cases/${c.id}/analysis`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shrink-0"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
