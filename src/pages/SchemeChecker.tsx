import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { schemeService, UserCivicProfile } from '../services/schemeService';
import { useLanguage } from '../context/LanguageContext';

export const SchemeChecker: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserCivicProfile>(() => schemeService.getProfile());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    schemeService.saveProfile(profile);
    navigate('/schemes/results');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Module 3 — Scheme Eligibility Checker
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Discover Benefits You May Qualify For</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enter your basic demographic profile to match government schemes, social security programs, and grants.
        </p>
      </div>

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          <UserCheck className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Civic Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              State of Residence
            </label>
            <input
              type="text"
              value={profile.state}
              onChange={e => setProfile({ ...profile, state: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Area Type
            </label>
            <select
              value={profile.areaType}
              onChange={e => setProfile({ ...profile, areaType: e.target.value as any })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="urban">Urban (City / Town)</option>
              <option value="rural">Rural (Village / Panchayat)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Age Range
            </label>
            <select
              value={profile.ageRange}
              onChange={e => setProfile({ ...profile, ageRange: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="18_35">18 - 35 Years (Youth)</option>
              <option value="36_59">36 - 59 Years (Adult)</option>
              <option value="60_plus">60+ Years (Senior Citizen)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Occupation Category
            </label>
            <select
              value={profile.occupationCategory}
              onChange={e => setProfile({ ...profile, occupationCategory: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="self_employed">Unorganized / Self-Employed / Vendor</option>
              <option value="farmer_agricultural">Farmer / Agricultural Worker</option>
              <option value="student">Student / Academic</option>
              <option value="unemployed">Unemployed</option>
              <option value="formal_govt">Formal Salaried Employee</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Annual Household Income Range
            </label>
            <select
              value={profile.incomeRange}
              onChange={e => setProfile({ ...profile, incomeRange: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="under_1l">Under ₹100,000 / BPL</option>
              <option value="1l_2.5l">₹100,000 - ₹250,000 (EWS)</option>
              <option value="2.5l_8l">₹250,000 - ₹800,000 (LIG/MIG)</option>
              <option value="above_8l">Above ₹800,000</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="studentCheck"
              checked={profile.studentStatus}
              onChange={e => setProfile({ ...profile, studentStatus: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5"
            />
            <label htmlFor="studentCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              Currently Enrolled Student
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition cursor-pointer"
          >
            <span>Check Potential Scheme Matches</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
