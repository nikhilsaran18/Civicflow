import React from 'react';
import { Compass, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CivicFlow AI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              An open-ended AI civic and legal empowerment platform for Indian citizens. Transforming bureaucratic complexity into actionable steps without predefined domain restrictions.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{t('safetyDisclaimer')}</span>
            </div>
          </div>

          {/* Core Principles */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Our Core Principles</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• No predefined civic domains</li>
              <li>• No hardcoded questionnaires</li>
              <li>• Case-specific AI dynamic reasoning</li>
              <li>• 2-pass question relevance validation</li>
              <li>• Direct Action Studio document drafts</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="https://rtionline.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">RTI Online Portal</a></li>
              <li><a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">CPGRAMS Grievance Portal</a></li>
              <li><a href="https://consumerhelpline.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">National Consumer Helpline</a></li>
              <li><a href="https://www.ugc.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">UGC Student Grievance</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CivicFlow AI. Built for Indian Citizen Empowerment.</p>
          <p className="flex items-center gap-1">
            <span>Designed for Indian Civic Empowerment</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
