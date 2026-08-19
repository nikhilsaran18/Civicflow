import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, Sun, Moon, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '../context/LanguageContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { caseService } from '../services/caseService';
import { storageService } from '../services/storageService';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Toast } from '../components/common/Toast';

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [confirmModal, setConfirmModal] = useState<'demo' | 'clear' | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleResetDemo = () => {
    caseService.resetDemoData();
    setConfirmModal(null);
    setToastMessage('Demo cases successfully reset to default state.');
  };

  const handleClearAllData = () => {
    storageService.clearAll();
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage('')}
        />
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          App Settings & Data Controls
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Customize language, appearance mode, and prototype state.
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
            <Globe className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold">Language Selection</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-2xl border text-xs font-bold transition ${
                language === 'en'
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`p-4 rounded-2xl border text-xs font-bold transition ${
                language === 'ta'
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              தமிழ் (Tamil)
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`p-4 rounded-2xl border text-xs font-bold transition ${
                language === 'hi'
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
            <Sun className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold">Appearance Theme</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as ThemeMode[]).map(m => (
              <button
                key={m}
                onClick={() => setTheme(m)}
                className={`p-4 rounded-2xl border text-xs font-bold uppercase transition ${
                  theme === m
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Prototype Data Controls */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <RefreshCw className="w-5 h-5" />
            <h2 className="text-base font-bold">Prototype Reset & Storage</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setConfirmModal('demo')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Reset Seed Demo Cases
            </button>
            <button
              onClick={() => setConfirmModal('clear')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
            >
              Clear All Local Storage
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal === 'demo'}
        title="Reset Demo Cases?"
        message="This will restore the default demonstration cases for Arun Kumar. Any custom cases created will remain intact."
        confirmLabel="Reset Demo Data"
        onConfirm={handleResetDemo}
        onCancel={() => setConfirmModal(null)}
      />

      <ConfirmationModal
        isOpen={confirmModal === 'clear'}
        title="Clear All Local Data?"
        message="This will erase all saved cases, accounts, and preferences stored in your browser LocalStorage."
        confirmLabel="Erase Everything"
        onConfirm={handleClearAllData}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
};
