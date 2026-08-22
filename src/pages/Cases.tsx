import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Search, Clock, ArrowRight, FolderOpen, CheckCircle, AlertCircle, Archive } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CivicCase } from '../types/civicIntelligence';
import { CaseStorageService } from '../services/caseStorageService';

export const Cases: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [cases, setCases] = useState<CivicCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loaded = CaseStorageService.getCases();
    setCases(loaded);
  }, []);

  const filteredCases = cases.filter(c => {
    const titleStr = c.title || '';
    const origStr = c.originalProblem || '';
    const aiDescStr = c.aiCaseDescription || '';

    const matchesSearch =
      titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      origStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aiDescStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved cases? This will reset the workspace.')) {
      CaseStorageService.clearAll();
      setCases([]);
    }
  };

  const getStatusBadge = (status: CivicCase['status']) => {
    switch (status) {
      case 'action_required':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">● {t('statusActionRequired')}</span>;
      case 'analysing':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">● {t('statusAnalysing')}</span>;
      case 'waiting':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">● {t('statusWaiting')}</span>;
      case 'resolved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">✓ {t('statusResolved')}</span>;
      case 'archived':
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">{t('statusArchived')}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-200/60 pb-6">
        <div>
          <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider">Citizen Dashboard</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-editorial">{t('navMyCases')}</h1>
        </div>

        <div className="flex items-center gap-3">
          {cases.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2.5 btn-lavender-secondary font-bold text-xs rounded-xl transition-all"
            >
              {t('clearAllCases')}
            </button>
          )}

          <Link
            to="/case/new"
            className="px-5 py-3 btn-royal-primary font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('startNewCase')}</span>
          </Link>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 lavender-card p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search cases or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-purple-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'action_required', 'analysing', 'waiting', 'resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/80 hover:text-purple-900'
              }`}
            >
              {st === 'all' ? 'All' : st === 'action_required' ? t('statusActionRequired') : st === 'analysing' ? t('statusAnalysing') : st === 'waiting' ? t('statusWaiting') : t('statusResolved')}
            </button>
          ))}
        </div>
      </div>

      {/* Case Cards Grid */}
      {filteredCases.length === 0 ? (
        <div className="lavender-card p-12 text-center space-y-4 shadow-2xs">
          <FolderOpen className="w-12 h-12 text-purple-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 font-editorial">No cases match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Describe a new civic or legal problem to start tracking action steps and generating documents.
          </p>
          <button
            onClick={() => navigate('/case/new')}
            className="px-4 py-2.5 btn-royal-primary font-bold text-xs rounded-xl"
          >
            {t('startNewCase')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/case/${c.id}`)}
              className="lavender-card-interactive p-6 space-y-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-extrabold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200 truncate uppercase">
                  🏷️ {c.categoryBadge || c.solution?.categoryBadge || c.understanding?.categoryBadge || 'CIVIC MATTER'}
                </span>
                {getStatusBadge(c.status)}
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-700 transition-colors line-clamp-1 font-editorial">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  "{c.originalProblem}"
                </p>
              </div>

              <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>

                <span className="font-extrabold text-purple-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {t('viewPlan')} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

