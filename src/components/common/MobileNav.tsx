import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, FolderKanban, BarChart3, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const MobileNav: React.FC = () => {
  const { t } = useLanguage();

  const items = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/cases/new', label: 'New Case', icon: PlusCircle, highlight: true },
    { to: '/cases', label: 'Cases', icon: FolderKanban },
    { to: '/rti-builder', label: 'RTI', icon: FileText },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                item.highlight
                  ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                  : isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
