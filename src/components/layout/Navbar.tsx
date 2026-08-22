import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Globe, Menu, X, Settings as SettingsIcon, PlusCircle, LogOut, User as UserIcon } from 'lucide-react';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  const isRouteActive = (path: string) => {
    if (isAuthRoute) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Citizen';

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };


  return (
    <header className="sticky top-0 z-50 glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-editorial">
                  CivicFlow
                </span>
                <span className="bg-purple-100/90 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border border-purple-200 uppercase tracking-wider">
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
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isRouteActive('/')
                  ? 'bg-[#F3EEFF] text-[#6D28D9] font-bold border border-[#E9D5FF]'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
              }`}
            >
              {t('navHome')}
            </Link>

            <Link
              to="/case/new"
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all ${
                isRouteActive('/case/new') || isRouteActive('/cases/new')
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'btn-royal-primary'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              {t('navNewCase')}
            </Link>

            <Link
              to="/cases"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isRouteActive('/cases') && !location.pathname.includes('/case/new')
                  ? 'bg-[#F3EEFF] text-[#6D28D9] font-bold border border-[#E9D5FF]'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
              }`}
            >
              {t('navMyCases')}
            </Link>

            <Link
              to="/forms"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isRouteActive('/forms')
                  ? 'bg-[#F3EEFF] text-[#6D28D9] font-bold border border-[#E9D5FF]'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
              }`}
            >
              {t('navForms')}
            </Link>

            <Link
              to="/rti"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isRouteActive('/rti')
                  ? 'bg-[#F3EEFF] text-[#6D28D9] font-bold border border-[#E9D5FF]'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
              }`}
            >
              {t('navRTI')}
            </Link>
          </nav>

          {/* Right Controls: Language Selector & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center bg-purple-50/80 rounded-xl px-2.5 py-1 border border-purple-200/90 shadow-2xs">
              <Globe className="w-4 h-4 text-purple-600 mr-1.5" />
              <select
                value={language}
                onChange={handleLangChange}
                className="bg-transparent text-xs font-bold text-purple-900 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">English (EN)</option>
                <option value="ta">தமிழ் (TA)</option>
                <option value="hi">हिन्दी (HI)</option>
              </select>
            </div>

            <Link
              to="/settings"
              className="p-2 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50/80 transition-colors"
              title={t('navSettings')}
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-900 text-xs font-extrabold rounded-xl border border-purple-200">
                  <UserIcon className="w-3.5 h-3.5 text-purple-600" />
                  <span className="truncate max-w-[120px]">{displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('signOut')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`text-xs font-extrabold px-4 py-2 rounded-xl transition-all ${
                  isAuthRoute
                    ? 'btn-royal-primary'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                }`}
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

          {user ? (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{displayName}</span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 px-3 py-1.5 bg-rose-50 rounded-lg"
              >
                {t('signOut')}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-3 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm"
            >
              {t('navLogin')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
