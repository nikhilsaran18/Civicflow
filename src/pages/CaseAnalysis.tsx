import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Sparkles, FileText, ExternalLink, Info, Check } from 'lucide-react';
import { caseService } from '../services/caseService';
import { CivicCase } from '../types';
import { PriorityGauge } from '../components/analysis/PriorityGauge';
import { ReadinessBar } from '../components/analysis/ReadinessBar';
import { EvidenceChecklist } from '../components/analysis/EvidenceChecklist';
import { ActionTimeline } from '../components/analysis/ActionTimeline';
import { WhatIfSimulator } from '../components/analysis/WhatIfSimulator';
import { PathComparison } from '../components/analysis/PathComparison';
import { useLanguage } from '../context/LanguageContext';
import { getWorkflowByCategory } from '../engine/rulesEngine';

export const CaseAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [currentCase, setCurrentCase] = useState<CivicCase | null>(null);

  useEffect(() => {
    if (!id) return;
    const found = caseService.getCaseById(id);
    if (found) {
      setCurrentCase(found);
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  if (!currentCase) return null;

  const wf = getWorkflowByCategory(currentCase.category);
  const analysis = currentCase.analysis;

  const handleToggleStep = (stepId: string) => {
    const updated = caseService.toggleStepCompleted(currentCase.id, stepId);
    setCurrentCase(updated);
  };

  const handleToggleEvidence = (evidenceId: string) => {
    const updated = caseService.toggleEvidenceChecked(currentCase.id, evidenceId);
    setCurrentCase(updated);
  };

  const handleMarkNextStepCompleted = () => {
    const currentStep = analysis.actionPlan.find(s => s.status === 'current');
    if (currentStep) {
      handleToggleStep(currentStep.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300">
              {currentCase.category.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 font-medium">Case ID: #{currentCase.id.slice(-6)}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentCase.title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/cases/${currentCase.id}/wizard`}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Questions</span>
          </Link>
          <Link
            to="/cases"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 transition"
          >
            All Cases
          </Link>
        </div>
      </div>

      {/* Recommended Next Step Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-indigo-800/40 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-300">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider">{t.analysis.nextActionTitle}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
          {analysis.nextBestAction}
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-indigo-800/60">
          <div className="text-xs text-indigo-200">
            Current Stage: <span className="font-bold text-white">{analysis.pathwayStage}</span>
          </div>

          <button
            onClick={handleMarkNextStepCompleted}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t.analysis.markCompleted}</span>
          </button>
        </div>
      </div>

      {/* Core Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PriorityGauge score={analysis.priorityScore} level={analysis.priorityLevel} />
        <ReadinessBar score={analysis.readinessScore} />
      </div>

      {/* Explainability Reasoning Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Info className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>{t.analysis.whyTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Explainable decision signals evaluated by CivicFlow rule engine.
          </p>
        </div>

        <div className="space-y-2.5">
          {analysis.reasoning.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 ${
                item.type === 'positive'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                  : item.type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="font-bold shrink-0">
                {item.type === 'positive' ? '✓' : item.type === 'warning' ? '⚠' : 'ℹ'}
              </span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Evidence Checklist (Ticking updates score live) */}
      <EvidenceChecklist
        category={currentCase.category}
        evidenceChecked={currentCase.evidenceChecked || {}}
        onToggle={handleToggleEvidence}
      />

      {/* What-If Simulator WOW feature */}
      <WhatIfSimulator
        category={currentCase.category}
        currentReadiness={analysis.readinessScore}
        evidenceChecked={currentCase.evidenceChecked || {}}
      />

      {/* Case Timeline */}
      <ActionTimeline
        actionPlan={analysis.actionPlan}
        onToggleStep={handleToggleStep}
      />

      {/* Case Path Comparison WOW feature */}
      <PathComparison category={currentCase.category} />

      {/* Source Citation Footer if verified URL exists */}
      {wf.sourceUrl && (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Verified Guidance Source: <strong className="text-slate-700 dark:text-slate-300">{wf.sourceLabel}</strong></span>
          <a
            href={wf.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center space-x-1"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
