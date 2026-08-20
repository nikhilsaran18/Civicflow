import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Compass, Globe, Menu, X, FileText, FolderCheck, Settings as SettingsIcon, LogIn, PlusCircle } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800">
                  CivicFlow
                </span>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-indigo-200/60 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block -mt-1">
                {t('tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('navHome')}
            </Link>

            <Link
              to="/case/new"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                isActive('/case/new') || isActive('/cases/new')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              {t('navNewCase')}
            </Link>

            <Link
              to="/cases"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/cases')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('navMyCases')}
            </Link>

            <Link
              to="/forms"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/forms')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('navForms')}
            </Link>

            <Link
              to="/rti"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/rti')
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('navRTI')}
            </Link>
          </nav>

          {/* Right Controls: Language Selector & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center bg-slate-100 rounded-lg px-2 py-1 border border-slate-200">
              <Globe className="w-4 h-4 text-slate-500 mr-1.5" />
              <select
                value={language}
                onChange={handleLangChange}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">English (EN)</option>
                <option value="ta">தமிழ் (TA)</option>
                <option value="hi">हिन्दी (HI)</option>
              </select>
            </div>

            <Link
              to="/settings"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={t('navSettings')}
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  {user.name}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-xs font-medium text-slate-500 hover:text-rose-600 px-2 py-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
              >
                {t('navLogin')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <select
              value={language}
              onChange={handleLangChange}
              className="bg-slate-100 text-xs font-semibold text-slate-700 rounded-md px-2 py-1 border border-slate-200"
            >
              <option value="en">EN</option>
              <option value="ta">TA</option>
              <option value="hi">HI</option>
            </select>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('navHome')}
          </Link>
          <Link
            to="/case/new"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white"
          >
            + {t('navNewCase')}
          </Link>
          <Link
            to="/cases"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('navMyCases')}
          </Link>
          <Link
            to="/forms"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('navForms')}
          </Link>
          <Link
            to="/rti"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('navRTI')}
          </Link>
          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('navSettings')}
          </Link>
        </div>
      )}
    </header>
  );
};
