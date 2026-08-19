import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActionStep } from '../../types';

interface ActionTimelineProps {
  actionPlan: ActionStep[];
  onToggleStep: (stepId: string) => void;
}

export const ActionTimeline: React.FC<ActionTimelineProps> = ({ actionPlan, onToggleStep }) => {
  const handleStepClick = (stepId: string) => {
    onToggleStep(stepId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Action Path Timeline</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Click &quot;Mark as Completed&quot; to advance your case stage.
        </p>
      </div>

      {/* Desktop Horizontal View */}
      <div className="hidden md:flex items-start justify-between relative px-4 py-2">
        <div className="absolute top-7 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        
        {actionPlan.map((step) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center max-w-[160px] text-center group">
              <button
                onClick={() => handleStepClick(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-100 dark:ring-emerald-950'
                    : isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950 scale-110 shadow-lg shadow-brand-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.stepNumber}
              </button>

              <span className={`mt-3 text-xs font-bold ${isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                {step.title}
              </span>

              {step.estimatedDays && (
                <span className="mt-1 text-[10px] text-slate-400 font-medium">
                  {step.estimatedDays}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile & Detailed Step List */}
      <div className="space-y-4">
        {actionPlan.map((step) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-brand-50/70 dark:bg-brand-950/20 border-brand-300 dark:border-brand-800 ring-1 ring-brand-500/30'
                  : isCompleted
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-90'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {step.stepNumber}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{step.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-600 text-white">
                          Current Stage
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition shrink-0 ml-2 ${
                    isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600 shadow-sm'
                  }`}
                >
                  {isCompleted ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
