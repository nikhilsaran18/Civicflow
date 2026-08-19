import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, Sparkles, AlertTriangle, FileCheck, Layers, Award, Lock, Zap, ChevronDown, ChevronUp, Cpu, Heart, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Landing: React.FC = () => {
  const { t } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'Does CivicFlow AI replace a lawyer or legal representative?',
      a: 'No. CivicFlow AI is a decision-support and civic-navigation platform. It provides general informational guidance and structures your evidence so you know what action step to take next. It does not replace professional legal representation.'
    },
    {
      q: 'How does the Local NLP Issue Classifier work without paid APIs?',
      a: 'CivicFlow uses a client-side Naive Bayes and token-similarity engine implemented natively in TypeScript. It analyzes input text, tokenizes key signals, and maps them to our civic knowledge base locally in your browser.'
    },
    {
      q: 'Is my personal information uploaded to external servers?',
      a: 'No. Prototype data and case records remain strictly stored in your local browser LocalStorage. No sensitive credentials or government ID documents are requested or uploaded.'
    },
    {
      q: 'How can I generate a Right to Information (RTI) application?',
      a: 'Navigate to our RTI Builder tool, fill in the applicant and public department details, and CivicFlow will generate a structured RTI application draft under Section 6(1) of the RTI Act 2005. You can copy or print it directly.'
    }
  ];

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white p-6 sm:p-12 shadow-2xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{t.hero.demoNotice}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            {t.hero.title}{' '}
            <span className="bg-gradient-to-r from-brand-300 via-indigo-200 to-emerald-300 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-brand-600/30 hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700 hover:border-slate-600 transition flex items-center justify-center space-x-2"
            >
              <span>Quick Demo Account</span>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Mock Analysis Card */}
        <div className="mt-12 max-w-3xl mx-auto bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-indigo-800/50 shadow-2xl backdrop-blur-xl text-left space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Decision Intelligence Engine</span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HIGH PRIORITY (78/100)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Issue Classified</span>
              <span className="text-sm font-extrabold text-white mt-1 block">Consumer Complaint</span>
              <span className="text-[10px] text-emerald-400 font-semibold">✓ 91% Local Confidence</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Evidence Readiness</span>
              <span className="text-sm font-extrabold text-amber-400 mt-1 block">75% Ready</span>
              <span className="text-[10px] text-slate-400">Missing: Written Complaint</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Next Best Action</span>
              <span className="text-sm font-extrabold text-brand-300 mt-1 block">Send Written Complaint</span>
              <span className="text-[10px] text-slate-400">Step 2 of 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Highlights Bar */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-3xl font-black text-brand-600 dark:text-brand-400">10,000+</span>
          <span className="text-xs text-slate-500 font-semibold block uppercase">Action Pathways</span>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">94%</span>
          <span className="text-xs text-slate-500 font-semibold block uppercase">Clarity Index</span>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-3xl font-black text-amber-600 dark:text-amber-400">100%</span>
          <span className="text-xs text-slate-500 font-semibold block uppercase">Local Intelligence</span>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">0 Paid APIs</span>
          <span className="text-xs text-slate-500 font-semibold block uppercase">Zero External Cost</span>
        </div>
      </section>

      {/* Domain Categories */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">Supported Civic Domains</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Guided Pathways for Core Grievances</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">CivicFlow AI provides adaptive questionnaires and action plans for four essential domains.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t.categories.consumer}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{t.categories.consumerDesc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t.categories.municipal}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{t.categories.municipalDesc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t.categories.rti}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{t.categories.rtiDesc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-lg transition group">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{t.categories.tenant}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{t.categories.tenantDesc}</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-12 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">Simple 4-Step Process</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How CivicFlow AI Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400">01</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">Describe</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Tell CivicFlow what happened in plain English or local language.</p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400">02</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">Assess</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Answer a few dynamic questions tailored specifically to your issue.</p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400">03</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">Understand</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Review priority score, evidence readiness %, and missing document checklists.</p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
            <span className="text-3xl font-black text-brand-600 dark:text-brand-400">04</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">Act</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Follow recommended action steps and track your timeline to resolution.</p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Everything You Need to Know</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-brand-500 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
