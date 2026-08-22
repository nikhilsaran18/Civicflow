import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, CheckCircle2, FileText, Zap, BookOpen, Layers, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TranslatorService, TranslationResult } from '../services/translatorService';

const EXAMPLE_PROMPTS = [
  "My father's pension stopped three months ago unexpectedly.",
  "My university won't return my original certificates.",
  "I applied for a caste certificate through the government portal six weeks ago and it still shows under processing.",
  "My landlord is refusing to return my security deposit even though I moved out two weeks ago.",
  "The street light outside my house hasn't worked for 10 days.",
  "My teacher refused to refund my fee.",
];


export const Landing: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [problemInput, setProblemInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Simple language translator interactive demo state
  const [bureaucraticInput, setBureaucraticInput] = useState(
    'Applicant may submit a representation before the competent authority regarding deficiency of service.'
  );
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % EXAMPLE_PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCase = (text?: string) => {
    const query = text || problemInput;
    if (!query.trim()) return;
    navigate('/case/new', { state: { initialProblem: query } });
  };

  const handleTranslateDemo = async () => {
    setTranslating(true);
    const res = await TranslatorService.explainSimply(bureaucraticInput);
    setTranslationResult(res);
    setTranslating(false);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white">
        {/* Background glow graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-teal-400/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Open-Ended AI Civic & Legal Empowerment Engine</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white max-w-4xl mx-auto">
            {t('heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Large Problem Input Box */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/20 shadow-2xl space-y-3">
            <div className="relative">
              <textarea
                value={problemInput}
                onChange={e => setProblemInput(e.target.value)}
                placeholder={EXAMPLE_PROMPTS[placeholderIndex]}
                rows={3}
                className="w-full bg-slate-900/80 text-white placeholder-slate-400 rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 border border-slate-700/80 resize-none shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                No legal terminology needed • Dynamic AI reasoning
              </span>

              <button
                onClick={() => handleStartCase()}
                disabled={!problemInput.trim()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-bold text-sm hover:from-teal-300 hover:to-emerald-400 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>{t('findNextStep')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Interactive Trigger Example Chips */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('tryExample')} (Click to test live):
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              {EXAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStartCase(prompt)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-white/15 transition-all text-left truncate max-w-[280px]"
                  title={prompt}
                >
                  💡 "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STATEMENT SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('trustTitle')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {['The law', 'The department', 'The form', 'The legal category'].map((item, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-center font-bold text-slate-700 text-sm shadow-sm"
              >
                ✕ {item}
              </div>
            ))}
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
            "{t('trustSubtitle')}"
          </p>
        </div>
      </section>

      {/* 4-STEP HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('howItWorksTitle')}</h2>
          <p className="text-slate-600 text-sm">Four simple steps from describing a problem to taking real legal action.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step4Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* WHY CIVICFLOW IS DIFFERENT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Why CivicFlow AI is Different</h2>
          <p className="text-slate-600 text-sm">No fixed categories. No hardcoded questionnaires. Pure case intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Way */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <AlertCircle className="w-5 h-5" />
              <span>Old Civic Bots / Fixed Systems</span>
            </div>
            <ul className="space-y-3 text-xs text-rose-900">
              <li className="flex items-start gap-2">
                <span className="font-bold">✕</span>
                <span>Forces user to select legal domain upfront (Consumer, Tenant, Workplace).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✕</span>
                <span>Asks generic canned questions (e.g. asking for "receipt" on a street light complaint!).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✕</span>
                <span>Fails completely on novel or ambiguous citizen problems.</span>
              </li>
            </ul>
          </div>

          {/* CivicFlow Way */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>CivicFlow AI Engine</span>
            </div>
            <ul className="space-y-3 text-xs text-emerald-950">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                <span>Understands the citizen narrative first in natural language.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                <span>Generates 1–4 high-value missing questions evaluated by 2-pass Question Validator.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                <span>Generates case-specific Action Plan and editable Action Studio document drafts.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SIMPLE-LANGUAGE TRANSLATOR DEMO SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Interactive Feature: "Explain Simply"</h3>
            <p className="text-xs text-slate-400">Translate complex bureaucratic jargon into citizen-friendly language.</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Paste Bureaucratic Text:</label>
          <textarea
            value={bureaucraticInput}
            onChange={e => setBureaucraticInput(e.target.value)}
            rows={2}
            className="w-full bg-slate-800 text-white p-3 rounded-xl text-sm border border-slate-700 focus:outline-none focus:border-teal-400"
          />
          <button
            onClick={handleTranslateDemo}
            disabled={translating}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            {translating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>Explain Simply</span>
          </button>
        </div>

        {translationResult && (
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2 animate-fadeIn">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">Simple Explanation:</h4>
            <p className="text-sm font-medium text-slate-100">{translationResult.simpleExplanation}</p>
            {translationResult.keyTakeaways.length > 0 && (
              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-xs font-semibold text-slate-400">Key Takeaways:</span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mt-1">
                  {translationResult.keyTakeaways.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* CTA SECTION */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-3xl p-10 shadow-xl space-y-4">
          <h2 className="text-3xl font-extrabold">Ready to resolve your civic or legal issue?</h2>
          <p className="text-indigo-100 text-sm max-w-xl mx-auto">
            No registration required to try a case. Get immediate clarity and an action plan in minutes.
          </p>
          <button
            onClick={() => navigate('/case/new')}
            className="px-8 py-4 bg-white text-indigo-900 font-extrabold text-sm rounded-xl hover:bg-indigo-50 shadow-lg transition-all"
          >
            Start Your Case Now
          </button>
        </div>
      </section>
    </div>
  );
};
