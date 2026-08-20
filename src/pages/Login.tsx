import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || 'citizen@civicflow.in', 'Citizen User');
    navigate('/cases');
  };

  const handleGuestDemo = () => {
    login('guest@civicflow.in', 'Guest Citizen');
    navigate('/case/new');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white mx-auto shadow-md">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign in to CivicFlow AI</h1>
        <p className="text-xs text-slate-600">Save and sync your civic cases and document drafts.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Sign In
          </button>
        </form>

        <div className="relative border-t border-slate-200 text-center py-2">
          <span className="bg-white px-3 text-xs font-semibold text-slate-400 relative -top-3">
            Or for Hackathon Evaluation
          </span>
        </div>

        <button
          onClick={handleGuestDemo}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <UserCheck className="w-4 h-4 text-teal-400" />
          <span>Continue as Guest (No Login Required)</span>
        </button>
      </div>
    </div>
  );
};
