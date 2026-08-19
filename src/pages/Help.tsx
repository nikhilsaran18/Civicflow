import React from 'react';
import { HelpCircle, ShieldAlert, Sparkles, FileCheck, Layers, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Help: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Help & Civic Knowledge Base
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Learn how CivicFlow AI processes grievances, calculates scores, and guides your action path.
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
        <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Informational Purpose Disclaimer</span>
        </div>
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          {t.app.disclaimer} CivicFlow AI is a decision-support and civic-navigation tool. It does not provide formal legal representation or legal counsel. Always consult qualified legal professionals or official government department guidelines for binding legal proceedings.
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>How does Priority Scoring work?</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Priority scores (0–100) are computed dynamically based on financial impact, safety hazards, issue duration, and whether previous direct resolution attempts failed.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            <span>What is Evidence Readiness?</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Evidence Readiness (0–100%) measures how well your case documents (invoices, written complaints, photos, bank receipts) support your claim before formal escalation.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Is my data private?</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Yes! For this Phase-1 prototype, all case details and answers are persisted locally in your browser&apos;s LocalStorage. No confidential credentials or identity cards are uploaded.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>How does the RTI Builder work?</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The RTI Builder converts your query details into a structured application adhering to Section 6(1) of the RTI Act 2005. You can copy the text or print it as a clean document.
          </p>
        </div>
      </div>
    </div>
  );
};
