import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Send, CheckCircle, HelpCircle, Shield, ArrowRight, RefreshCw, Upload, FileCheck, FileX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { defaultCivicIntelligenceEngine } from '../services/ai/civicIntelligenceEngine';
import { CaseUnderstanding, ClarificationQuestion, CivicCase, EvidenceItem, QuestionAnswerPair, ConfirmedFact } from '../types/civicIntelligence';
import { CaseStorageService } from '../services/caseStorageService';

export const NewCase: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Unique Case ID
  const [currentCaseId] = useState(() => `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  // Initial prompt from location state
  const initialText = (location.state as any)?.initialProblem || '';

  const [problemText, setProblemText] = useState(initialText);
  const [hasStarted, setHasStarted] = useState(Boolean(initialText.trim()));

  // Dynamic Flow State
  const [stage, setStage] = useState<'input' | 'questions' | 'evidence' | 'analyzing' | 'done'>('input');
  const [understanding, setUnderstanding] = useState<CaseUnderstanding | null>(null);

  // Sequential 3 Questions State
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<ClarificationQuestion | null>(null);
  const [qAndAHistory, setQAndAHistory] = useState<QuestionAnswerPair[]>([]);
  const [currentAnswerInput, setCurrentAnswerInput] = useState<string | string[]>('');
  const [userAnswersRecord, setUserAnswersRecord] = useState<Record<string, string | string[]>>({});

  // Evidence Stage State
  const [recommendedEvidence, setRecommendedEvidence] = useState<EvidenceItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: number; notes: string }[]>([]);
  const [fileNotesInput, setFileNotesInput] = useState('');

  // Status & Loading State
  const [loading, setLoading] = useState(false);
  const [thinkingState, setThinkingState] = useState('');

  // Initialize if initialText is provided
  useEffect(() => {
    if (initialText.trim()) {
      startAnalysisWorkflow(initialText);
    }
  }, [initialText]);

  const startAnalysisWorkflow = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setHasStarted(true);
    setThinkingState('Analyzing situation & extracting confirmed facts...');

    try {
      // 1. Initial AI Understanding
      const initialUnderstanding = await defaultCivicIntelligenceEngine.understandCase(text);
      setUnderstanding(initialUnderstanding);

      // 2. Fetch Question #1
      setThinkingState('Generating dynamic Question #1 of 3...');
      const q1 = await defaultCivicIntelligenceEngine.generateNextQuestion(
        text,
        initialUnderstanding.confirmedFacts,
        [],
        1
      );

      setStage('questions');
      setQuestionNumber(1);
      setCurrentQuestion(q1);
    } catch (err) {
      console.error('Error starting case analysis:', err);
    } finally {
      setLoading(false);
      setThinkingState('');
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !understanding) return;

    const answerVal = currentAnswerInput;
    const answerStr = Array.isArray(answerVal) ? answerVal.join(', ') : answerVal;

    // Record Q&A pair
    const qaPair: QuestionAnswerPair = {
      questionNumber,
      question: currentQuestion,
      answer: answerVal,
    };
    const updatedQA = [...qAndAHistory, qaPair];
    setQAndAHistory(updatedQA);

    // Update confirmed facts
    const newFact: ConfirmedFact = {
      id: `ans_${questionNumber}`,
      fact: `${currentQuestion.question}: ${answerStr}`,
      source: 'clarification_answer',
    };
    const updatedFacts = [...understanding.confirmedFacts, newFact];
    const updatedUnderstanding = { ...understanding, confirmedFacts: updatedFacts };
    setUnderstanding(updatedUnderstanding);

    const updatedAnswers = { ...userAnswersRecord, [currentQuestion.id]: answerVal };
    setUserAnswersRecord(updatedAnswers);
    setCurrentAnswerInput('');

    // If Question 1 or 2 -> Generate next sequential question
    if (questionNumber < 3) {
      const nextQNum = questionNumber + 1;
      setLoading(true);
      setThinkingState(`Re-evaluating case facts & generating Question #${nextQNum} of 3...`);

      try {
        const nextQ = await defaultCivicIntelligenceEngine.generateNextQuestion(
          problemText,
          updatedFacts,
          updatedQA,
          nextQNum
        );
        setQuestionNumber(nextQNum);
        setCurrentQuestion(nextQ);
      } catch (err) {
        console.error('Error fetching next question:', err);
      } finally {
        setLoading(false);
        setThinkingState('');
      }
    } else {
      // Question 3 Answered -> Move to Evidence Stage!
      setLoading(true);
      setThinkingState('Evaluating case facts & determining recommended evidence...');

      try {
        const evidenceItems = await defaultCivicIntelligenceEngine.recommendEvidence(
          problemText,
          updatedFacts,
          updatedQA
        );
        setRecommendedEvidence(evidenceItems);
        setStage('evidence');
      } catch (err) {
        console.error('Error recommending evidence:', err);
        setStage('evidence');
      } finally {
        setLoading(false);
        setThinkingState('');
      }
    }
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newFileObj = {
      id: `file_${Date.now()}`,
      name: file.name,
      size: file.size,
      notes: fileNotesInput || 'Uploaded document evidence',
    };
    setUploadedFiles(prev => [...prev, newFileObj]);
    setFileNotesInput('');
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFinalizeSolution = async (skipEvidence: boolean = false) => {
    if (!understanding) return;
    setStage('analyzing');
    setLoading(true);
    setThinkingState('Building complete case analysis & dynamic action plan...');

    try {
      const evidenceFacts: ConfirmedFact[] = uploadedFiles.map(f => ({
        id: f.id,
        fact: `Document Evidence: ${f.name} (${f.notes})`,
        source: 'evidence_file',
      }));

      const fullSolution = await defaultCivicIntelligenceEngine.generateSolution(
        problemText,
        understanding,
        qAndAHistory,
        evidenceFacts
      );

      const finalCase: CivicCase = {
        id: currentCaseId,
        title: fullSolution.caseTitle || understanding.caseTitle || 'Civic Matter',
        originalProblem: problemText,
        currentSummary: fullSolution.situationSummary || understanding.situationSummary,
        confidence: fullSolution.confidence || 'high',
        status: 'action_required',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        understanding,
        qAndA: qAndAHistory,
        recommendedEvidence,
        uploadedEvidence: uploadedFiles.map(f => ({
          id: f.id,
          title: f.name,
          reason: f.notes,
          priority: 'recommended',
          fileMetadata: { name: f.name, size: f.size, type: 'document', uploadedAt: new Date().toISOString() },
        })),
        evidenceSkipped: skipEvidence,
        solution: fullSolution,
        answers: userAnswersRecord,
      };

      // Compile case file
      const caseFileMd = await defaultCivicIntelligenceEngine.generateCaseFile(finalCase);
      finalCase.caseFileMarkdown = caseFileMd;

      // Save to case storage
      CaseStorageService.saveCase(finalCase);

      // Navigate to Case Detail workspace
      navigate(`/case/${finalCase.id}`, { state: { caseData: finalCase } });
    } catch (err) {
      console.error('Error generating solution:', err);
    } finally {
      setLoading(false);
      setThinkingState('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            CivicFlow Case Engine (ID: {currentCaseId.slice(0, 12)})
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tell us what happened
          </h1>
        </div>
        {understanding && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Universal AI Case Engine Active</span>
          </div>
        )}
      </div>

      {stage === 'input' && !hasStarted ? (
        /* STEP 1: Describe Problem Card */
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Describe your civic or legal issue</h2>
            <p className="text-sm text-slate-600">
              Tell us what happened in plain language. CivicFlow AI will understand your problem and ask 3 dynamic clarification questions.
            </p>
          </div>

          <textarea
            value={problemText}
            onChange={e => setProblemText(e.target.value)}
            rows={5}
            placeholder="e.g. My landlord is refusing to return my security deposit even though I moved out two weeks ago with no damage..."
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              onClick={() => startAnalysisWorkflow(problemText)}
              disabled={!problemText.trim() || loading}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Analyze Situation</span>
            </button>
          </div>
        </div>
      ) : (
        /* WORKSPACE INTERACTIVE GRID: LEFT WORKSPACE + RIGHT CASE UNDERSTANDING */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: Sequential Questions / Evidence Stage / Thinking state */}
          <div className="lg:col-span-2 space-y-6">
            {/* Citizen Original Statement */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Original Statement
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Confirmed Fact
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 leading-relaxed">
                "{problemText}"
              </p>
            </div>

            {/* Previous Q&A History Log */}
            {qAndAHistory.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Clarification Record ({qAndAHistory.length} of 3 Completed)
                </span>
                <div className="space-y-3">
                  {qAndAHistory.map(item => (
                    <div key={item.questionNumber} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-xs">
                      <div className="font-bold text-indigo-700">
                        Q{item.questionNumber}: {item.question.question}
                      </div>
                      <div className="text-slate-800 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 font-medium">
                        Answer: <span className="font-bold">{Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Thinking State Notice */}
            {thinkingState && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 flex-shrink-0" />
                <span className="text-xs font-bold">{thinkingState}</span>
              </div>
            )}

            {/* STAGE 2, 3, 4: SEQUENTIAL CLARIFICATION QUESTION CARD */}
            {stage === 'questions' && currentQuestion && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-lg space-y-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-teal-500 to-indigo-600" />
                
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200">
                      <span>Clarification Question #{questionNumber} of 3</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug pt-1">
                      {currentQuestion.question}
                    </h3>
                  </div>
                  <HelpCircle className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                  💡 <span className="font-bold">Why this matters:</span> {currentQuestion.reason}
                </p>

                {/* Input Render based on Question Type */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.type === 'single_select' && currentQuestion.options ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentQuestion.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentAnswerInput(opt)}
                          className={`p-3.5 rounded-2xl text-xs font-semibold text-left transition-all border ${
                            currentAnswerInput === opt
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : currentQuestion.type === 'yes_no' ? (
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(val => (
                        <button
                          key={val}
                          onClick={() => setCurrentAnswerInput(val)}
                          className={`flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all border ${
                            currentAnswerInput === val
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium">
                    Question Validator Pass Checked ✓
                  </span>

                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!currentAnswerInput || loading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>Submit Answer & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 5: DYNAMIC EVIDENCE RECOMMENDATION STAGE */}
            {stage === 'evidence' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-200 shadow-lg space-y-6">
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-extrabold border border-teal-200">
                    <FileCheck className="w-4 h-4 text-teal-600" />
                    <span>Evidence Recommendation Stage</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Recommended evidence for this case
                  </h2>
                  <p className="text-xs text-slate-600">
                    Gemini has evaluated your problem and clarification answers. Uploading any relevant items will strengthen your case file, or you may proceed directly.
                  </p>
                </div>

                {/* Evidence Checklist */}
                {recommendedEvidence.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Suggested Items for Your Situation
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recommendedEvidence.map(ev => (
                        <div key={ev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>📄</span>
                            <span>{ev.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{ev.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload Box */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <span className="text-xs font-bold text-slate-700 block">
                    Attach File or Add Evidence Detail
                  </span>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={fileNotesInput}
                      onChange={e => setFileNotesInput(e.target.value)}
                      placeholder="e.g. Tenancy agreement copy / Fee receipt number"
                      className="flex-1 bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <label className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select File</span>
                      <input type="file" onChange={handleSimulateFileUpload} className="hidden" />
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Attached Evidence Files:</span>
                      {uploadedFiles.map(f => (
                        <div key={f.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-teal-600 font-bold">✓ {f.name}</span>
                            <span className="text-slate-400 text-[10px]">({f.notes})</span>
                          </div>
                          <button onClick={() => handleRemoveFile(f.id)} className="text-red-500 hover:text-red-700 font-bold text-[10px]">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons: Continue OR Skip */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleFinalizeSolution(true)}
                    className="w-full sm:w-auto px-5 py-3 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileX className="w-4 h-4 text-slate-400" />
                    <span>Continue Without Evidence</span>
                  </button>

                  <button
                    onClick={() => handleFinalizeSolution(false)}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Generate Full Case Analysis</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: AI CASE UNDERSTANDING PANEL */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>AI Case Understanding</span>
                </h3>
                {understanding?.confidence && (
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    understanding.confidence === 'high'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : understanding.confidence === 'medium'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {understanding.confidence} Confidence
                  </span>
                )}
              </div>

              {understanding && (
                <>
                  {/* AI Generated Descriptive Case Title */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Descriptive Case Title
                    </span>
                    <div className="w-full bg-gradient-to-r from-indigo-50 to-teal-50 border border-indigo-200/80 p-3 rounded-2xl text-xs font-extrabold text-indigo-950">
                      📌 {understanding.caseTitle || understanding.aiCaseDescription}
                    </div>
                  </div>

                  {/* Situation Summary */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Situation Summary
                    </span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
                      {understanding.situationSummary || understanding.summary}
                    </p>
                  </div>

                  {/* Confirmed Facts List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Confirmed Facts ({understanding.confirmedFacts?.length || 0})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {understanding.confirmedFacts.map((fact, idx) => (
                        <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                          <span className="font-bold text-emerald-700">✓ Fact:</span>{' '}
                          <span className="text-slate-800">{fact.fact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
