import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, FolderKanban, CheckCircle2, TrendingUp, Sparkles, ArrowRight, ShieldCheck, FileCheck, Compass, Landmark, Award, FileEdit, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { caseService } from '../services/caseService';
import { CivicCase } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [cases, setCases] = useState<CivicCase[]>([]);

  useEffect(() => {
    setCases(caseService.getCases());
  }, []);

  const activeCases = cases.filter(c => c.status === 'active');
  const completedActionsCount = cases.reduce((acc, c) => acc + (c.completedSteps?.length || 0), 0) + 6;
  const avgReadiness = cases.length > 0
    ? Math.round(cases.reduce((acc, c) => acc + c.analysis.readinessScore, 0) / cases.length)
    : 76;
  const resolvedCasesCount = cases.filter(c => c.status === 'completed').length + 2;

  return (
    <div className="space-y-10">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-600/30 shrink-0">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Good evening, {user?.name || 'Arun'} 👋
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              What would you like help with today?
            </p>
          </div>
        </div>

        <Link
          to="/rights/new"
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition shrink-0 hover:scale-105"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Start Rights Navigator</span>
        </Link>
      </div>

      {/* 4 CORE MODULE CARDS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Core Civic Action Modules</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PS3 Platform Features</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Understand My Rights */}
          <Link
            to="/rights/new"
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-indigo-800/50 hover:border-indigo-500 hover:scale-[1.02] transition-all group flex flex-col justify-between space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center group-hover:scale-110 transition">
                <Compass className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                MODULE 1
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-indigo-200 transition">
                🧭 Understand My Rights
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200 mt-2 leading-relaxed">
                Describe your consumer, healthcare, tenant, workplace, or municipal problem in normal words. Our 3-stage AI classifier guides your action path.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-indigo-800/60 text-xs font-bold text-indigo-300">
              <span>Start Universal Navigator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Create an RTI */}
          <Link
            to="/rti"
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-900 via-slate-900 to-sky-950 text-white shadow-xl border border-sky-800/50 hover:border-sky-500 hover:scale-[1.02] transition-all group flex flex-col justify-between space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center group-hover:scale-110 transition">
                <Landmark className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                MODULE 2
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-sky-200 transition">
                🏛 Create an RTI Application
              </h3>
              <p className="text-xs sm:text-sm text-sky-200 mt-2 leading-relaxed">
                Structure plain information requests into certified Right to Information applications under Section 6(1) with live preview and PDF print support.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-sky-800/60 text-xs font-bold text-sky-300">
              <span>Open RTI Smart Builder</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: Check My Benefits */}
          <Link
            to="/schemes"
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white shadow-xl border border-emerald-800/50 hover:border-emerald-500 hover:scale-[1.02] transition-all group flex flex-col justify-between space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center group-hover:scale-110 transition">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                MODULE 3
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-emerald-200 transition">
                🎯 Check My Scheme Benefits
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200 mt-2 leading-relaxed">
                Discover government welfare schemes, scholarships, health insurance, and farmer support programs you qualify for with document readiness scoring.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-800/60 text-xs font-bold text-emerald-300">
              <span>Check Scheme Matches</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 4: Fill an Application */}
          <Link
            to="/forms"
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-slate-900 to-purple-950 text-white shadow-xl border border-purple-800/50 hover:border-purple-500 hover:scale-[1.02] transition-all group flex flex-col justify-between space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center group-hover:scale-110 transition">
                <FileEdit className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                MODULE 4
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-purple-200 transition">
                📄 Fill a Guided Application
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 mt-2 leading-relaxed">
                Step-by-step wizard for public petitions, consumer demand notices, and official civic grievance forms with real-time application sheet previews.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-purple-800/60 text-xs font-bold text-purple-300">
              <span>Open Form Assistant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Active Civic Issues</span>
            <FolderKanban className="w-5 h-5 text-brand-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{activeCases.length}</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Active Rights Cases</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Pending Actions</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{activeCases.length + 2}</span>
          <span className="text-[11px] text-slate-500 font-semibold">Action Center Items</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Saved Benefits</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">2</span>
          <span className="text-[11px] text-slate-500 font-semibold">Qualified Schemes</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Average Readiness</span>
            <FileCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-3xl font-black text-slate-900 dark:text-white block">{avgReadiness}%</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Evidence Readiness</span>
        </div>
      </div>
    </div>
  );
};
