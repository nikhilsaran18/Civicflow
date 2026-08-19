import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, FileCheck, RefreshCw, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { caseService } from '../services/caseService';
import { CivicCase } from '../types';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useLanguage } from '../context/LanguageContext';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [currentCase, setCurrentCase] = useState<CivicCase | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = caseService.getCaseById(id);
    if (found) {
      setCurrentCase(found);
    } else {
      navigate('/cases');
    }
  }, [id, navigate]);

  if (!currentCase) return null;

  const handleDelete = () => {
    if (id) {
      caseService.deleteCase(id);
      navigate('/cases');
    }
  };

  const handleToggleStep = (stepId: string) => {
    const updated = caseService.toggleStepCompleted(currentCase.id, stepId);
    setCurrentCase(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/cases"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Cases</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            to={`/cases/${currentCase.id}/analysis`}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20"
          >
            View Scorecard & Analysis
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Delete Case"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
            {currentCase.category.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">Created: {new Date(currentCase.createdAt).toLocaleDateString()}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentCase.title}</h1>

        {currentCase.userDescription && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            &quot;{currentCase.userDescription}&quot;
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Priority</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {currentCase.analysis.priorityScore} / 100
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Readiness</span>
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
              {currentCase.analysis.readinessScore}%
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Completed Steps</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {currentCase.completedSteps?.length || 0} / {currentCase.analysis.actionPlan.length}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Status</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
              {currentCase.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action Plan Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Action Steps Breakdown</span>
        </h2>

        <div className="space-y-3">
          {currentCase.analysis.actionPlan.map(step => {
            const isCompleted = currentCase.completedSteps?.includes(step.id);
            return (
              <div
                key={step.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}>
                    {step.stepNumber}
                  </div>
                  <span className={`font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {step.title}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleStep(step.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold border ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isCompleted ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete this Case?"
        message="This action cannot be undone."
        confirmLabel="Delete Case"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
