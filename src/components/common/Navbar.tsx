import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Sun, Moon, LogOut, User as UserIcon, Menu, X, PlusCircle, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-ping" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-600 dark:from-white dark:via-indigo-300 dark:to-brand-400 bg-clip-text text-transparent">
                CivicFlow <span className="text-brand-600 dark:text-brand-400 font-black">AI</span>
              </span>
              <span className="hidden sm:flex items-center space-x-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                <span>Civic Decision Intelligence</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (When authenticated or landing) */}
          <div className="hidden md:flex items-center space-x-1">
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    location.pathname === '/' ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/help"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    location.pathname === '/help' ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  How It Works
                </Link>
              </>
            )}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Dropdown */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-200/80 dark:border-slate-700/80">
              <Globe className="w-4 h-4 text-brand-500 mr-1.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Auth CTA */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/cases/new"
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-brand-600/25 hover:scale-105 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t.nav.newCase}</span>
                </Link>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                  <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="truncate max-w-[90px]">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 px-3.5 py-2"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl shadow-md shadow-brand-600/20 hover:scale-105 transition-all"
                >
                  {t.nav.getStarted}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1"
            >
              <option value="en">🇬邦 English</option>
              <option value="ta">🇮🇳 தமிழ்</option>
              <option value="hi">🇮🇳 हिन्दी</option>
            </select>
          </div>

          {isAuthenticated ? (
            <div className="space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-2"
              >
                Dashboard
              </Link>
              <Link
                to="/cases/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-brand-600 dark:text-brand-400 py-2"
              >
                + {t.nav.newCase}
              </Link>
              <Link
                to="/cases"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-2"
              >
                {t.nav.myCases}
              </Link>
              <Link
                to="/rti-builder"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-2"
              >
                {t.nav.rtiBuilder}
              </Link>
              <Link
                to="/insights"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200 py-2"
              >
                Insights & Analytics
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left text-sm font-semibold text-rose-600 py-2"
              >
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-semibold text-slate-700 dark:text-slate-200 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-bold text-white bg-brand-600 py-2.5 rounded-xl"
              >
                {t.nav.getStarted}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
