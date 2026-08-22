// Prototype-only local authentication. Replace with server-side authentication for production.
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LoginProps {
  defaultTab?: 'login' | 'register';
}

export const Login: React.FC<LoginProps> = ({ defaultTab = 'login' }) => {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = (location.state as any)?.from?.pathname || '/cases';

  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMessage(t('invalidEmailOrPassword'));
    } else {
      navigate(fromPath, { replace: true });
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage(t('passwordTooShort'));
      return;
    }
    if (!confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    const { error } = await signUp(fullName, email, password);
    setLoading(false);

    if (error) {
      setErrorMessage(t('emailAlreadyExists'));
    } else {
      setSuccessMessage(t('accountCreatedSuccess'));
      setFullName('');
      setPassword('');
      setConfirmPassword('');
      setTab('login'); // Automatically switch to Login tab per specification
    }
  };

  const switchTab = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Non-Interactive Ambient Floating Spheres */}
      <div className="bg-ambient-orb-1" aria-hidden="true" />
      <div className="bg-ambient-orb-2" aria-hidden="true" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo & Platform Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight font-editorial">CivicFlow</span>
            <span className="bg-purple-100/90 text-purple-800 text-xs font-extrabold px-2 py-0.5 rounded-md border border-purple-200 uppercase">
              AI
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            AI-Powered Civic & Legal Empowerment Platform
          </p>
        </div>

        {/* Auth Container Card */}
        <div className="lavender-card p-6 sm:p-8 space-y-6 shadow-[0_24px_70px_rgba(88,28,135,0.08)]">
          {/* Segmented Tab Bar */}
          <div className="grid grid-cols-2 p-1 bg-purple-50/80 rounded-2xl border border-purple-200/70">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                  : 'text-slate-500 hover:text-purple-900'
              }`}
            >
              {t('loginTab')}
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-white text-purple-900 shadow-sm border border-purple-200'
                  : 'text-slate-500 hover:text-purple-900'
              }`}
            >
              {t('createAccountTab')}
            </button>
          </div>

          {/* Alert Message Box */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700 font-medium animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full bg-white border border-purple-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-white border border-purple-200/90 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 btn-royal-primary text-xs font-extrabold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('signingIn')}</span>
                  </>
                ) : (
                  <span>{t('signInBtn')}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  {t('dontHaveAccount')}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="text-xs font-extrabold text-purple-700 hover:text-purple-900 hover:underline"
                >
                  {t('createAccountBtn')}
                </button>
              </div>
            </form>
          ) : (
            /* --- CREATE ACCOUNT FORM --- */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t('fullNameLabel')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Citizen Name"
                  autoComplete="name"
                  className="w-full bg-white border border-purple-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full bg-white border border-purple-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="w-full bg-white border border-purple-200/90 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {t('confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className="w-full bg-white border border-purple-200/90 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? t('hidePassword') : t('showConfirmPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 btn-royal-primary text-xs font-extrabold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('creatingAccount')}</span>
                  </>
                ) : (
                  <span>{t('createAccountBtn')}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  {t('alreadyHaveAccount')}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="text-xs font-extrabold text-purple-700 hover:text-purple-900 hover:underline"
                >
                  {t('signInBtn')}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Local Hackathon Auth Note */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>CivicFlow AI Hackathon Local Prototype • Privacy Preserved</span>
          </p>
        </div>
      </div>
    </div>
  );
};
