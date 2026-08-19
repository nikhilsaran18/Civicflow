import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieIcon, TrendingUp, ShieldCheck } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { caseService } from '../services/caseService';
import { CivicCase } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const Insights: React.FC = () => {
  const { t } = useLanguage();
  const [cases, setCases] = useState<CivicCase[]>([]);

  useEffect(() => {
    setCases(caseService.getCases());
  }, []);

  // Category distribution data
  const categoryCounts = cases.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = [
    { name: 'Consumer', count: categoryCounts['consumer'] || 0, color: '#4f46e5' },
    { name: 'Municipal', count: categoryCounts['municipal'] || 0, color: '#0d9488' },
    { name: 'RTI Request', count: categoryCounts['rti'] || 0, color: '#f59e0b' },
    { name: 'Tenant', count: categoryCounts['tenant'] || 0, color: '#f43f5e' },
  ];

  // Readiness distribution data
  const readinessChartData = cases.map(c => ({
    name: c.title.slice(0, 15) + '...',
    readiness: c.analysis.readinessScore,
    priority: c.analysis.priorityScore,
  }));

  // Step Completion data
  const completionChartData = cases.map(c => ({
    name: c.title.slice(0, 15) + '...',
    completed: c.completedSteps?.length || 0,
    total: c.analysis.actionPlan.length,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Civic Analytics & Insights
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Visual breakdowns of your active cases, readiness distributions, and completion velocity.
        </p>
      </div>

      {/* Grid of Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Cases by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cases by Civic Category</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Readiness vs Priority Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Evidence Readiness vs Priority Score</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="readiness" fill="#10b981" name="Readiness %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="priority" fill="#f43f5e" name="Priority Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Action Step Completion Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Action Steps Completion Progress</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completed" fill="#6366f1" name="Completed Steps" radius={[0, 4, 4, 0]} />
                <Bar dataKey="total" fill="#334155" name="Total Required Steps" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
