import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Layers, Award, Lock, CheckCircle2 } from 'lucide-react';
import { classifyIssue } from '../engine/classifier';
import { CivicCategory, ClassificationResult } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { caseService } from '../services/caseService';

export const NewCase: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const handleAnalyse = () => {
    if (!description.trim()) return;
    const classified = classifyIssue(description);
    setResult(classified);
  };

  const handleStartWizardWithCategory = (category: CivicCategory) => {
    // Title auto-generated from description snippet or category name
    const titleSnippet = description.trim()
      ? description.slice(0, 40) + (description.length > 40 ? '...' : '')
      : `${category.toUpperCase()} Case`;

    const newCase = caseService.createCase(
      titleSnippet,
      category,
      {},
      description.trim()
    );

    navigate(`/cases/${newCase.id}/wizard`);
  };

  const categoriesConfig: { cat: CivicCategory; title: string; desc: string; icon: any }[] = [
    { cat: 'consumer', title: t.categories.consumer, desc: t.categories.consumerDesc, icon: ShieldCheck },
    { cat: 'municipal', title: t.categories.municipal, desc: t.categories.municipalDesc, icon: Layers },
    { cat: 'rti', title: t.categories.rti, desc: t.categories.rtiDesc, icon: Award },
    { cat: 'tenant', title: t.categories.tenant, desc: t.categories.tenantDesc, icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Step Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Step 1 of 3 — Issue Navigation
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t.newCase.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t.newCase.subtitle}</p>
      </div>

      {/* Free-text Natural Language Input Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Natural Language Local Classifier</span>
        </div>

        <textarea
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t.newCase.textareaPlaceholder}
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyse}
            disabled={!description.trim()}
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-600/20 flex items-center space-x-2 transition cursor-pointer"
          >
            <span>{t.newCase.analyseBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Classification Result Preview */}
        {result && (
          <div className="mt-6 p-6 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-brand-600 dark:text-brand-400">
                  {t.newCase.likelyCategory}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize mt-1">
                  {result.category} Complaint
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-500 block">{t.newCase.confidence}</span>
                <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{result.confidence}%</span>
              </div>
            </div>

            {result.matchedSignals.length > 0 && (
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Matched Tokens:</span>
                {result.matchedSignals.map((sig, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    #{sig}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => handleStartWizardWithCategory(result.category)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2"
              >
                <span>{t.newCase.proceedWithCategory}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setResult(null)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
              >
                {t.newCase.chooseDifferent}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Category Selection Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white text-center">
          {t.newCase.manualTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoriesConfig.map(c => {
            const Icon = c.icon;
            return (
              <div
                key={c.cat}
                onClick={() => handleStartWizardWithCategory(c.cat)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-md transition cursor-pointer group flex items-start space-x-4"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
