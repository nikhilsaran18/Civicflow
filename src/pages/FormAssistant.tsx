import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { formService } from '../services/formService';
import { useLanguage } from '../context/LanguageContext';

export const FormAssistant: React.FC = () => {
  const { t } = useLanguage();
  const templates = formService.getTemplates();
  const drafts = formService.getDrafts();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          Module 4 — Guided Form Assistant
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Complete Civic Forms Step by Step</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Guided step-by-step assistant for official petitions, consumer demand notices, and public service requests.
        </p>
      </div>

      {/* Form Templates Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Available Form Templates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(tmpl => (
            <div
              key={tmpl.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {tmpl.category}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{tmpl.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">{tmpl.steps.length} Simple Steps</span>
                <Link
                  to={`/forms/${tmpl.id}/fill`}
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center space-x-1"
                >
                  <span>Fill Form</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
