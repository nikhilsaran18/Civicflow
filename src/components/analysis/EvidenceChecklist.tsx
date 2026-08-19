import React from 'react';
import { Check, X, FileText } from 'lucide-react';
import { CivicCategory } from '../../types';
import { getWorkflowByCategory } from '../../engine/rulesEngine';

interface EvidenceChecklistProps {
  category: CivicCategory;
  evidenceChecked: Record<string, boolean>;
  onToggle: (evidenceId: string) => void;
}

export const EvidenceChecklist: React.FC<EvidenceChecklistProps> = ({
  category,
  evidenceChecked,
  onToggle,
}) => {
  const wf = getWorkflowByCategory(category);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Interactive Evidence Checklist</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Check off items as you gather them. Your readiness score updates live.
        </p>
      </div>

      <div className="space-y-2.5">
        {wf.evidenceItems.map(item => {
          const isChecked = !!evidenceChecked[item.id];
          return (
            <div
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isChecked
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition ${
                  isChecked
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isChecked ? 'text-emerald-900 dark:text-emerald-300 line-through' : 'text-slate-900 dark:text-white'}`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    +{item.weight}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
