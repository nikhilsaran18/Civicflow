import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, ShieldAlert, Info, RefreshCw, CheckCircle2, AlertTriangle, Layers, Lock, Award, HeartPulse, Building2, Landmark, GraduationCap, Coins } from 'lucide-react';
import { classifyCivicCase } from '../engine/hierarchicalClassifier';
import { CivicClassification, RightsDomain } from '../types';
import { caseService } from '../services/caseService';
import { useLanguage } from '../context/LanguageContext';

export const RightsNewCase: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState<CivicClassification | null>(null);
  const [manualDomain, setManualDomain] = useState<RightsDomain | null>(null);

  const handleAnalyse = () => {
    if (!description.trim()) return;
    const result = classifyCivicCase(description);
    setClassification(result);
    setManualDomain(null);
  };

  const selectedDomain: RightsDomain = manualDomain || (classification ? classification.domain : 'consumer');

  const handleProceed = () => {
    const titleSnippet = description.trim()
      ? description.slice(0, 45) + (description.length > 45 ? '...' : '')
      : `${selectedDomain.toUpperCase()} Rights Case`;

    const newCase = caseService.createCase(
      titleSnippet,
      selectedDomain,
      {},
      description.trim()
    );

    navigate(`/cases/${newCase.id}/wizard`);
  };

  const domainOptions: { domain: RightsDomain; label: string; icon: any }[] = [
    { domain: 'healthcare_patient', label: 'Healthcare / Patient Rights', icon: HeartPulse },
    { domain: 'consumer', label: 'Consumer Rights', icon: ShieldCheck },
    { domain: 'housing_tenant', label: 'Housing & Tenant Rights', icon: Lock },
    { domain: 'workplace_labour', label: 'Workplace & Labour Rights', icon: Building2 },
    { domain: 'public_government_service', label: 'Public & Government Service', icon: Landmark },
    { domain: 'municipal_utility', label: 'Municipal & Utility', icon: Layers },
    { domain: 'education', label: 'Education & Institutional', icon: GraduationCap },
    { domain: 'rti_information', label: 'RTI & Public Information', icon: Award },
    { domain: 'banking_financial', label: 'Banking & Financial', icon: Coins },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Module 1 — Universal Rights Navigator
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Tell Us What Happened</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Describe your civic, consumer, workplace, or healthcare situation in simple words.
        </p>
      </div>

      {/* Input Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">3-Stage Local Hierarchical AI Classifier</span>
        </div>

        <textarea
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. I purchased a phone but the seller refuses to refund me, OR I have fever and the doctor at clinic is refusing to treat me..."
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none"
        />

        {/* Suggested Example Chips */}
        <div className="flex items-center space-x-2 flex-wrap gap-2 pt-1">
          <span className="text-xs text-slate-400 font-semibold">Try examples:</span>
          {[
            "Seller refusing my refund",
            "Doctor refusing to treat me",
            "Landlord withholding deposit",
            "Salary not paid for 2 months",
            "Streetlight non-functional"
          ].map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setDescription(ex); }}
              className="text-[11px] font-medium px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 transition"
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyse}
            disabled={!description.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-600/20 flex items-center space-x-2 transition cursor-pointer"
          >
            <span>Analyse My Situation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stage A — Out of Scope Safety Card */}
      {classification && !classification.inScope && (
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Outside CivicFlow Guided Coverage
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                This Request Cannot Be Guided as a Civic Grievance
              </h3>
              <p className="text-xs text-rose-900 dark:text-rose-200 mt-2 leading-relaxed">
                {classification.explanation}
              </p>
            </div>
          </div>

          {classification.scopeResult.isMedicalDiagnosisAttempt && (
            <div className="p-4 bg-amber-100/70 dark:bg-amber-950/50 rounded-2xl border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Safety Notice:</strong> If you or someone else requires urgent medical care, please visit your nearest hospital emergency room or call emergency health services immediately.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stage B & C — In Scope AI Classification Card */}
      {classification && classification.inScope && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                ✨ CivicFlow AI Analysis
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize mt-1">
                {selectedDomain.replace(/_/g, ' ')}
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Domain Confidence</span>
                <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                  {Math.round(classification.domainConfidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Detected Situation Pattern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Detected Situation Pattern</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-1 block">
                {classification.pattern.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Matched Context Signals</span>
              <div className="flex items-center space-x-1.5 flex-wrap gap-1 mt-1">
                {classification.matchedSignals.map((sig, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                    #{sig}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Moderate / Low Confidence Prompt */}
          {classification.domainConfidence < 0.75 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <span className="font-bold block">We think this may relate to {selectedDomain.replace(/_/g, ' ')}.</span>
              <span>If this is not correct, please select the exact domain below before proceeding.</span>
            </div>
          )}

          {/* Manual Category Override Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Not correct? Change Category:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {domainOptions.map(opt => {
                const isSel = selectedDomain === opt.domain;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.domain}
                    type="button"
                    onClick={() => setManualDomain(opt.domain)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition ${
                      isSel
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Proceed CTA */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleProceed}
              className="px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-xl shadow-brand-600/30 flex items-center space-x-2 transition cursor-pointer"
            >
              <span>Start Guided Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
