import React, { useState } from 'react';
import { Globe, Key, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '../context/LanguageContext';
import { defaultGeminiClient } from '../services/ai/geminiClient';

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      defaultGeminiClient.setApiKey(apiKeyInput.trim());
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear saved local cases and settings?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-purple-200/60 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-editorial">{t('navSettings')}</h1>
        <p className="text-sm text-slate-600 font-medium">Manage application language, AI API keys, and local data.</p>
      </div>

      {/* Language Settings Card */}
      <div className="lavender-card p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 text-purple-900 font-extrabold text-base font-editorial">
          <Globe className="w-5 h-5 text-purple-700" />
          <h2>Interface Language</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'en', label: 'English (EN)' },
            { id: 'ta', label: 'தமிழ் (Tamil)' },
            { id: 'hi', label: 'हिन्दी (Hindi)' },
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as SupportedLanguage)}
              className={`p-4 rounded-2xl border text-xs font-extrabold text-center transition-all ${
                language === lang.id
                  ? 'bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-200'
                  : 'bg-white text-slate-700 border-purple-200/80 hover:bg-purple-50/60'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gemini AI API Key Card */}
      <div className="lavender-card p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-900 font-extrabold text-base font-editorial">
            <Key className="w-5 h-5 text-purple-700" />
            <h2>Google Gemini AI API Key (Optional)</h2>
          </div>
          {defaultGeminiClient.hasKey() && (
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ● API Key Active
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          CivicFlow AI features a built-in intelligent dynamic fallback engine for hackathons and offline use. You may optionally enter a custom Google Gemini API Key below for live cloud AI model calls.
        </p>

        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder="Paste your VITE_GEMINI_API_KEY here..."
            className="flex-1 bg-white border border-purple-200/90 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 shadow-2xs"
          />
          <button
            onClick={handleSaveKey}
            className="px-5 py-3 btn-royal-primary text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
          >
            {keySaved ? <CheckCircle2 className="w-4 h-4 text-purple-200" /> : null}
            <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
          </button>
        </div>
      </div>

      {/* Clear Storage */}
      <div className="bg-rose-50/70 p-6 sm:p-8 rounded-3xl border border-rose-200/90 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-rose-800 font-extrabold text-base font-editorial">
          <Trash2 className="w-5 h-5 text-rose-600" />
          <h2>Reset Local Storage Data</h2>
        </div>
        <p className="text-xs text-rose-950 font-medium">
          Clears all saved cases, language choices, and offline data stored in your browser.
        </p>
        <button
          onClick={handleClearData}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
        >
          Clear All Local Data
        </button>
      </div>
    </div>
  );
};

