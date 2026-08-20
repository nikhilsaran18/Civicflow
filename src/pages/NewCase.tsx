import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Send, CheckCircle, HelpCircle, Shield, AlertTriangle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { defaultCivicIntelligenceEngine } from '../services/ai/civicIntelligenceEngine';
import { CaseUnderstanding, ClarificationQuestion, CivicSolution, CivicCase } from '../types/civicIntelligence';
import { CaseStorageService } from '../services/caseStorageService';

export const NewCase: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Initial prompt from state or default
  const initialText = (location.state as any)?.initialProblem || '';

  const [problemText, setProblemText] = useState(initialText);
  const [hasStarted, setHasStarted] = useState(Boolean(initialText.trim()));

  const [understanding, setUnderstanding] = useState<CaseUnderstanding | null>(null);
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [currentAnswerInput, setCurrentAnswerInput] = useState<string | string[]>('');

  const [loading, setLoading] = useState(false);
  const [thinkingState, setThinkingState] = useState('');
  const [generatingSolution, setGeneratingSolution] = useState(false);

  // Initialize or re-analyze case when problem text changes or initialText is supplied
  useEffect(() => {
    if (initialText.trim()) {
      runInitialAnalysis(initialText);
    }
  }, [initialText]);

  const runInitialAnalysis = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setThinkingState('Understanding your situation...');
    setHasStarted(true);

    try {
      setTimeout(() => setThinkingState('Checking missing information...'), 600);
      setTimeout(() => setThinkingState('Validating question relevance...'), 1200);

      const res = await defaultCivicIntelligenceEngine.analyzeCase(text, userAnswers);
      setUnderstanding(res.understanding);
      setQuestions(res.questions);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Error analyzing case:', err);
    } finally {
      setLoading(false);
      setThinkingState('');
    }
  };

  const handleStartFromInput = () => {
    if (!problemText.trim()) return;
    runInitialAnalysis(problemText);
  };

  const handleAnswerSubmit = async () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    const updatedAnswers = {
      ...userAnswers,
      [currentQ.id]: currentAnswerInput,
    };
    setUserAnswers(updatedAnswers);
    setCurrentAnswerInput('');

    setLoading(true);
    setThinkingState('Updating case understanding...');

    try {
      const res = await defaultCivicIntelligenceEngine.analyzeCase(problemText, updatedAnswers);
      setUnderstanding(res.understanding);
      setQuestions(res.questions);

      if (res.questions.length > 0 && currentQuestionIndex < res.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setCurrentQuestionIndex(0);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setLoading(false);
      setThinkingState('');
    }
  };

  const handleGenerateSolution = async () => {
    if (!understanding) return;
    setGeneratingSolution(true);
    setThinkingState('Preparing your action plan & solution...');

    try {
      const solution = await defaultCivicIntelligenceEngine.generateSolution(
        problemText,
        understanding,
        userAnswers
      );

      const newCase: CivicCase = {
        id: `case_${Date.now()}`,
        title: understanding.aiCaseDescription || 'Civic Matter',
        originalProblem: problemText,
        currentSummary: understanding.summary,
        desiredOutcome: understanding.desiredOutcome,
        aiCaseDescription: understanding.aiCaseDescription,
        confidence: understanding.confidence,
        status: 'action_required',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        understanding,
        solution,
        answers: userAnswers,
      };

      CaseStorageService.saveCase(newCase);
      navigate(`/case/${newCase.id}`, { state: { caseData: newCase } });
    } catch (err) {
      console.error('Error generating solution:', err);
    } finally {
      setGeneratingSolution(false);
      setThinkingState('');
    }
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            {t('navNewCase')} Workspace
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tell us what happened
          </h1>
        </div>
        {understanding && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Case Engine Active</span>
          </div>
        )}
      </div>

      {!hasStarted ? (
        /* Initial Input Card */
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Describe your civic or legal issue</h2>
            <p className="text-sm text-slate-600">
              No need to know legal departments, laws, or forms. Simply write what happened in your own words.
            </p>
          </div>

          <textarea
            value={problemText}
            onChange={e => setProblemText(e.target.value)}
            rows={5}
            placeholder="e.g. The street light near my house has not worked for 10 days..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />

          <div className="flex justify-end">
            <button
              onClick={handleStartFromInput}
              disabled={!problemText.trim() || loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Analyze Problem</span>
            </button>
          </div>
        </div>
      ) : (
        /* Main Interactive Layout: LEFT Workspace + RIGHT Case Understanding Sidebar */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Conversation & Clarification Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Narrative Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Original Statement
                </span>
                <span className="text-xs font-medium text-slate-500">Confirmed Fact</span>
              </div>
              <p className="text-sm font-medium text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
                "{problemText}"
              </p>
            </div>

            {/* AI Thinking State Notice */}
            {thinkingState && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 flex-shrink-0" />
                <span className="text-xs font-semibold">{thinkingState}</span>
              </div>
            )}

            {/* Dynamic Question Card */}
            {currentQ && !understanding?.readyForSolution ? (
              <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md space-y-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-teal-400" />
                
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {t('askingNextQuestion')} (Question {currentQuestionIndex + 1} of {questions.length})
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {currentQ.question}
                    </h3>
                  </div>
                  <HelpCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  💡 <span className="font-semibold">Why this matters:</span> {currentQ.reason}
                </p>

                {/* Input render based on question type */}
                <div className="space-y-3 pt-2">
                  {currentQ.type === 'single_select' && currentQ.options ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentQ.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentAnswerInput(opt)}
                          className={`p-3 rounded-xl text-xs font-semibold text-left transition-all border ${
                            currentAnswerInput === opt
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : currentQ.type === 'yes_no' ? (
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(val => (
                        <button
                          key={val}
                          onClick={() => setCurrentAnswerInput(val)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
                            currentAnswerInput === val
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={typeof currentAnswerInput === 'string' ? currentAnswerInput : ''}
                      onChange={e => setCurrentAnswerInput(e.target.value)}
                      rows={3}
                      placeholder="Type your answer here..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    Question Validator 2-Pass Checked ✓
                  </span>

                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!currentAnswerInput || loading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>{t('submitAnswer')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Ready for Solution Card */
              <div className="bg-emerald-50/80 border border-emerald-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>{t('readyNotice')}</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  CivicFlow AI has gathered sufficient information to determine your rights, responsible authority, and practical step-by-step action plan.
                </p>
                <button
                  onClick={handleGenerateSolution}
                  disabled={generatingSolution}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {generatingSolution ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{t('proceedToSolution')}</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Dynamic Case Understanding Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>{t('caseUnderstandingTitle')}</span>
                </h3>
                {understanding?.confidence && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {understanding.confidence} Confidence
                  </span>
                )}
              </div>

              {understanding && (
                <>
                  {/* AI Generated Case Description Label */}
                  {understanding.aiCaseDescription && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('aiCaseDescriptionLabel')}
                      </span>
                      <div className="inline-block w-full bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-200/80 p-2.5 rounded-xl text-xs font-bold text-indigo-900">
                        📌 {understanding.aiCaseDescription}
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        Descriptive label only — does not limit system logic.
                      </p>
                    </div>
                  )}

                  {/* Problem Summary */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('problemSummary')}
                    </span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                      {understanding.summary}
                    </p>
                  </div>

                  {/* Known Facts */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('knownFacts')} ({understanding.knownFacts.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {understanding.knownFacts.map((fact, idx) => (
                        <div key={idx} className="bg-slate-50 p-2 rounded-md border border-slate-200/60 text-xs">
                          <span className="font-semibold text-slate-800">{fact.label}:</span>{' '}
                          <span className="text-slate-600">{fact.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Information */}
                  {understanding.missingInformation.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('missingInfo')}
                      </span>
                      <ul className="space-y-1">
                        {understanding.missingInformation.map((info, idx) => (
                          <li key={idx} className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200/60 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
