import React from 'react';
import { GitCompare, ArrowRight, ShieldCheck, Scale } from 'lucide-react';
import { CivicCategory } from '../../types';

interface PathComparisonProps {
  category: CivicCategory;
}

export const PathComparison: React.FC<PathComparisonProps> = ({ category }) => {
  const pathData = {
    consumer: {
      standard: ['Direct Written Notice', 'Helpline Mediation (1915)', 'Full Refund / Replacement'],
      escalated: ['Legal Demand Notice', 'District Consumer Commission', 'Court Hearing & Order']
    },
    municipal: {
      standard: ['Municipal App Ticket', 'Ward Inspector Follow-up', 'Sanitary Repair Work'],
      escalated: ['State Grievance Portal (CPGRAMS)', 'Municipal Commissioner Notice', 'Public Audit Enquiry']
    },
    rti: {
      standard: ['Submit RTI Application (₹10)', '30-Day PIO Response', 'Certified Documents Issued'],
      escalated: ['First Appellate Authority (FAA)', 'State Information Commission', 'Penalty Hearing on PIO']
    },
    tenant: {
      standard: ['Move-out Settlement Letter', '14-Day Deposit Refund', 'Receipt & Handover'],
      escalated: ['Legal Notice via Advocate', 'Rent Controller Petition', 'Money Recovery Decree']
    }
  }[category] || {
    standard: ['Direct Communication', 'Helpline Mediation', 'Resolution'],
    escalated: ['Formal Legal Notice', 'Regulatory Forum', 'Adjudication']
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
        <GitCompare className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        <h3 className="text-base font-bold">Case Path Comparison</h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        CivicFlow adapts your pathway. Compare the standard direct resolution route against the formal escalation route.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Path */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Standard Resolution Path (Faster & Low Cost)</span>
          </div>

          <div className="space-y-2">
            {pathData.standard.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Escalated Path */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
            <Scale className="w-4 h-4" />
            <span>Escalated / Formal Forum Path</span>
          </div>

          <div className="space-y-2">
            {pathData.escalated.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
