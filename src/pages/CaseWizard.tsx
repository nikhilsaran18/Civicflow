import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, CheckCircle, HelpCircle } from 'lucide-react';
import { caseService } from '../services/caseService';
import { getActiveQuestions } from '../engine/rulesEngine';
import { CivicCase, CivicQuestion } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const CaseWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [currentCase, setCurrentCase] = useState<CivicCase | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    const found = caseService.getCaseById(id);
    if (found) {
      setCurrentCase(found);
      setAnswers(found.answers || {});
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  if (!currentCase) return null;

  const activeQuestions: CivicQuestion[] = getActiveQuestions(currentCase.category, answers);
  const currentQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  const totalSteps = activeQuestions.length;
  const currentStepNum = Math.min(totalSteps, currentQuestionIndex + 1);
  const progressPercent = Math.round((currentStepNum / Math.max(1, totalSteps)) * 100);

  const handleSelectOption = (questionId: string, optionValue: string) => {
    setErrorMsg('');
    const newAnswers = { ...answers, [questionId]: optionValue };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    // Validation
    const currentAns = answers[currentQuestion.id];
    if (!currentAns) {
      setErrorMsg(t.wizard.required);
      return;
    }

    // Update case object
    const updatedCase: CivicCase = {
      ...currentCase,
      answers
    };
    caseService.updateCase(updatedCase);

    if (currentQuestionIndex + 1 < activeQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Completed wizard! Navigate to Case Analysis screen
      navigate(`/cases/${currentCase.id}/analysis`);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      navigate('/cases/new');
    }
  };

  const handleSaveAndExit = () => {
    const updatedCase: CivicCase = {
      ...currentCase,
      answers
    };
    caseService.updateCase(updatedCase);
    navigate('/cases');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Wizard Header Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>{currentCase.title}</span>
          <span className="text-brand-600 dark:text-brand-400">
            {t.wizard.step} {currentStepNum} {t.wizard.of} {totalSteps}
          </span>
        </div>

        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {currentQuestion.title}
            </h2>
            {currentQuestion.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {/* Option Buttons */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options?.map(opt => {
              const isSelected = answers[currentQuestion.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, opt.value)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-600 dark:border-brand-500 text-slate-900 dark:text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="text-sm font-semibold pr-4">{opt.label}</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.wizard.back}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSaveAndExit}
                className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{t.wizard.saveAndExit}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 flex items-center space-x-1"
              >
                <span>{currentQuestionIndex + 1 === totalSteps ? 'View Analysis' : t.wizard.continue}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
