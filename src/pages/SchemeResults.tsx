import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Bookmark, ExternalLink, ShieldCheck, Sparkles, FileCheck } from 'lucide-react';
import { schemeService, SchemeMatchResult } from '../services/schemeService';
import { useLanguage } from '../context/LanguageContext';

export const SchemeResults: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<SchemeMatchResult[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const profile = schemeService.getProfile();
    const evaluated = schemeService.evaluateMatches(profile);
    setMatches(evaluated);
    setSavedIds(schemeService.getSavedSchemeIds());
  }, []);

  const handleToggleSave = (schemeId: string) => {
    const updated = schemeService.toggleSaveScheme(schemeId);
    setSavedIds(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/schemes"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Profile Criteria</span>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Evaluated Government Scheme Matches</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Your Qualified Benefits & Schemes</h1>
        <p className="text-xs text-slate-500">
          Potentially eligible based on your profile details. Review match scores and document requirements before applying.
        </p>
      </div>

      {/* Scheme Match Cards List */}
      <div className="space-y-6">
        {matches.map(m => {
          const isSaved = savedIds.includes(m.scheme.id);
          return (
            <div
              key={m.scheme.id}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {m.scheme.category.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{m.scheme.name}</h3>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Match Score</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {m.matchPercentage}% Match
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleSave(m.scheme.id)}
                    className={`p-3 rounded-2xl border transition ${
                      isSaved
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={isSaved ? 'Remove from Saved' : 'Bookmark Scheme'}
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {m.scheme.summary}
              </p>

              {/* Benefits Summary Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300 font-semibold">
                🎁 Benefits: {m.scheme.benefitsSummary}
              </div>

              {/* Eligibility Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Eligibility Breakdown:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {m.matchedRules.map((rule, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                  {m.unmatchedRules.map((rule, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center space-x-2 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Steps & Link */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500">
                  Required Documents: {m.scheme.requiredDocuments.length} items
                </span>

                <a
                  href={m.scheme.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center space-x-1"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
