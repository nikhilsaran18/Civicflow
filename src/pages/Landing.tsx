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
    <div className="space-y-20 pb-20 relative overflow-hidden">
      {/* Decorative Non-Interactive Ambient Floating Spheres */}
      <div className="bg-ambient-orb-1" aria-hidden="true" />
      <div className="bg-ambient-orb-2" aria-hidden="true" />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-purple-900 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Open-Ended AI Civic & Legal Empowerment Engine</span>
          </div>

          {/* Main Title with Editorial Serif */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 font-editorial max-w-4xl mx-auto">
            {t('heroTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Large Problem Input Box */}
          <div className="max-w-3xl mx-auto lavender-card p-3 sm:p-5 shadow-[0_24px_70px_rgba(88,28,135,0.08)] space-y-3">
            <div className="relative">
              <textarea
                value={problemInput}
                onChange={e => setProblemInput(e.target.value)}
                placeholder={EXAMPLE_PROMPTS[placeholderIndex]}
                rows={3}
                className="w-full bg-white text-slate-900 placeholder-slate-400 rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-200/90 resize-none shadow-xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                No legal terminology needed • Dynamic AI reasoning
              </span>

              <button
                onClick={() => handleStartCase()}
                disabled={!problemInput.trim()}
                className="w-full sm:w-auto px-6 py-3.5 btn-royal-primary text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>{t('findNextStep')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Interactive Trigger Example Chips */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-purple-900/70">
              {t('tryExample')} (Click to test live):
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              {EXAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStartCase(prompt)}
                  className="text-xs bg-purple-50/80 hover:bg-purple-100/90 text-purple-950 px-3.5 py-1.5 rounded-xl border border-purple-200/80 font-bold transition-all text-left truncate max-w-[280px] shadow-2xs"
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
        <div className="lavender-card p-8 sm:p-12 space-y-6 relative overflow-hidden shadow-[0_20px_60px_rgba(88,28,135,0.06)]">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-editorial">
            {t('trustTitle')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {['The law', 'The department', 'The form', 'The legal category'].map((item, i) => (
              <div
                key={i}
                className="bg-purple-50/60 border border-purple-200/60 p-4 rounded-2xl text-center font-bold text-slate-800 text-sm shadow-2xs"
              >
                ✕ {item}
              </div>
            ))}
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight font-editorial">
            "{t('trustSubtitle')}"
          </p>
        </div>
      </section>

      {/* 4-STEP HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-editorial">{t('howItWorksTitle')}</h2>
          <p className="text-slate-600 text-sm">Four simple steps from describing a problem to taking real legal action.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="lavender-card-interactive p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-extrabold text-lg font-editorial shadow-2xs">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
          </div>

          <div className="lavender-card-interactive p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-extrabold text-lg font-editorial shadow-2xs">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
          </div>

          <div className="lavender-card-interactive p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-extrabold text-lg font-editorial shadow-2xs">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
          </div>

          <div className="lavender-card-interactive p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-extrabold text-lg font-editorial shadow-2xs">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t('step4Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* WHY CIVICFLOW IS DIFFERENT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 font-editorial">Why CivicFlow AI is Different</h2>
          <p className="text-slate-600 text-sm">No fixed categories. No hardcoded questionnaires. Pure case intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Way */}
          <div className="bg-rose-50/70 border border-rose-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-base">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Old Civic Bots / Fixed Systems</span>
            </div>
            <ul className="space-y-3 text-xs text-rose-950 font-medium">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">✕</span>
                <span>Forces user to select legal domain upfront (Consumer, Tenant, Workplace).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">✕</span>
                <span>Asks generic canned questions (e.g. asking for "receipt" on a street light complaint!).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-600">✕</span>
                <span>Fails completely on novel or ambiguous citizen problems.</span>
              </li>
            </ul>
          </div>

          {/* CivicFlow Way */}
          <div className="lavender-card p-6 sm:p-8 space-y-4 shadow-md border-purple-300/80">
            <div className="flex items-center gap-2 text-purple-900 font-extrabold text-base">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              <span>CivicFlow AI Engine</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-800 font-medium">
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">✓</span>
                <span>Understands the citizen narrative first in natural language.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">✓</span>
                <span>Generates high-value missing questions evaluated by Evidence Sufficiency.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">✓</span>
                <span>Generates case-specific Action Plan and editable Action Studio document drafts.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SIMPLE-LANGUAGE TRANSLATOR DEMO SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 bg-slate-950 text-white rounded-3xl p-8 border border-purple-900/40 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-900/50 text-purple-300 rounded-xl border border-purple-700/40">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white font-editorial">Interactive Feature: "Explain Simply"</h3>
            <p className="text-xs text-slate-400">Translate complex bureaucratic jargon into citizen-friendly language.</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-extrabold text-purple-200 uppercase tracking-wider">Paste Bureaucratic Text:</label>
          <textarea
            value={bureaucraticInput}
            onChange={e => setBureaucraticInput(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 text-white p-3.5 rounded-xl text-sm border border-purple-800/60 focus:outline-none focus:border-purple-500 shadow-inner"
          />
          <button
            onClick={handleTranslateDemo}
            disabled={translating}
            className="px-5 py-2.5 btn-royal-primary font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            {translating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>Explain Simply</span>
          </button>
        </div>

        {translationResult && (
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-800/50 space-y-2 animate-fadeIn">
            <h4 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider">Simple Explanation:</h4>
            <p className="text-sm font-medium text-slate-100">{translationResult.simpleExplanation}</p>
            {translationResult.keyTakeaways.length > 0 && (
              <div className="pt-2 border-t border-purple-900/50">
                <span className="text-xs font-bold text-slate-400">Key Takeaways:</span>
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
        <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white rounded-3xl p-10 shadow-2xl space-y-4 border border-purple-500/30">
          <h2 className="text-3xl font-extrabold font-editorial">Ready to resolve your civic or legal issue?</h2>
          <p className="text-purple-100 text-sm max-w-xl mx-auto font-medium">
            No registration required to try a case. Get immediate clarity and an action plan in minutes.
          </p>
          <button
            onClick={() => navigate('/case/new')}
            className="px-8 py-4 bg-white text-purple-950 font-extrabold text-sm rounded-xl hover:bg-purple-50 shadow-xl transition-all hover:scale-105"
          >
            Start Your Case Now
          </button>
        </div>
      </section>
    </div>
  );
};

