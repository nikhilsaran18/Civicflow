import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            CF
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{t.app.name}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.app.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <Link to="/help" className="hover:text-brand-600 dark:hover:text-brand-400">
            {t.nav.help} & FAQ
          </Link>
          <Link to="/rti-builder" className="hover:text-brand-600 dark:hover:text-brand-400">
            {t.nav.rtiBuilder}
          </Link>
          <Link to="/settings" className="hover:text-brand-600 dark:hover:text-brand-400">
            {t.nav.settings}
          </Link>
        </div>

        <div className="text-center md:text-right text-xs text-slate-500 dark:text-slate-500 space-y-1">
          <div className="flex items-center justify-center md:justify-end space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Informational Civic Navigation Tool</span>
          </div>
          <p>© 2025 CivicFlow AI — Hackathon Edition</p>
        </div>
      </div>
    </footer>
  );
};
