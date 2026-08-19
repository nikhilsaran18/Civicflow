import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Landmark, Award, FileEdit, Zap, FolderKanban, BarChart3, HelpCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const primaryModules = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/rights/new', label: 'Rights Navigator', icon: Compass, highlight: true },
    { to: '/rti', label: 'RTI Smart Builder', icon: Landmark },
    { to: '/schemes', label: 'Scheme Checker', icon: Award },
    { to: '/forms', label: 'Form Assistant', icon: FileEdit },
    { to: '/actions', label: 'Action Center', icon: Zap },
  ];

  const secondaryLinks = [
    { to: '/cases', label: 'Saved Cases', icon: FolderKanban },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/help', label: 'Help & FAQ', icon: HelpCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors">
      <div className="space-y-4">
        {/* Core Modules Section */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Core Civic Modules
          </div>
          {primaryModules.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    link.highlight
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-600/20'
                      : isActive
                      ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Secondary Section */}
        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Management & Tools
          </div>
          {secondaryLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.nav.logout}</span>
        </button>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
          <p className="font-bold text-slate-700 dark:text-slate-300">PS3 Hackathon Platform</p>
          <p className="text-[10px]">Zero External API • 100% Client Intelligence</p>
        </div>
      </div>
    </aside>
  );
};
