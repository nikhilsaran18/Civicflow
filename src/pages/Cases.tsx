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
    if (loaded.length === 0) {
      // Seed initial demo cases for hackathon judge evaluation
      const demoSeeded: CivicCase[] = [
        {
          id: 'demo_case_1',
          title: 'Municipal Street Light Outage',
          originalProblem: 'The street light outside my house has not worked for 10 days.',
          currentSummary: 'Unmaintained street lamp in local municipal ward causing public safety concern.',
          aiCaseDescription: 'Municipal Infrastructure Grievance',
          confidence: 'high',
          status: 'action_required',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          messages: [],
          answers: { location: 'Ward 14, Main Road, Chennai' },
          understanding: {
            summary: 'Unmaintained public street light',
            knownFacts: [{ label: 'Duration', value: '10 days' }],
            missingInformation: [],
            desiredOutcomeKnown: true,
            desiredOutcome: 'Street light repair by municipal corporation',
            aiCaseDescription: 'Municipal Infrastructure Grievance',
            jurisdictionNeeded: false,
            confidence: 'high',
            readyForSolution: true,
          },
        },
        {
          id: 'demo_case_2',
          title: 'Withheld University Original Marksheets',
          originalProblem: 'My college refuses to return my original certificates.',
          currentSummary: 'Higher education institution withholding student marksheets in violation of UGC 2023 guidelines.',
          aiCaseDescription: 'Higher Education Student Grievance',
          confidence: 'high',
          status: 'action_required',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          messages: [],
          answers: { location: 'State University College' },
          understanding: {
            summary: 'College withholding original marksheets',
            knownFacts: [],
            missingInformation: [],
            desiredOutcomeKnown: true,
            desiredOutcome: 'Return of original certificates',
            aiCaseDescription: 'Higher Education Student Grievance',
            jurisdictionNeeded: false,
            confidence: 'high',
            readyForSolution: true,
          },
        },
      ];
      demoSeeded.forEach(c => CaseStorageService.saveCase(c));
      setCases(demoSeeded);
    } else {
      setCases(loaded);
    }
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.originalProblem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.aiCaseDescription && c.aiCaseDescription.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CivicCase['status']) => {
    switch (status) {
      case 'action_required':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">● Action Required</span>;
      case 'analysing':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">● Analysing</span>;
      case 'waiting':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">● Waiting</span>;
      case 'resolved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">✓ Resolved</span>;
      case 'archived':
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">Archived</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Citizen Dashboard</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('navMyCases')}</h1>
        </div>

        <Link
          to="/case/new"
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start New Case</span>
        </Link>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search cases or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'action_required', 'analysing', 'waiting', 'resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Case Cards Grid */}
      {filteredCases.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No cases match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Describe a new civic or legal problem to start tracking action steps and generating documents.
          </p>
          <button
            onClick={() => navigate('/case/new')}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
          >
            Create New Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/case/${c.id}`)}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 truncate">
                  📌 {c.aiCaseDescription || 'Civic Case'}
                </span>
                {getStatusBadge(c.status)}
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  "{c.originalProblem}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>

                <span className="font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Plan <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
