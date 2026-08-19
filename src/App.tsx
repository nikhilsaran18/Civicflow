import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

import { RightsNewCase } from './pages/RightsNewCase';
import { CaseWizard } from './pages/CaseWizard';
import { CaseAnalysis } from './pages/CaseAnalysis';
import { CaseDetail } from './pages/CaseDetail';

import { RTIBuilder } from './pages/RTIBuilder';
import { SchemeChecker } from './pages/SchemeChecker';
import { SchemeResults } from './pages/SchemeResults';
import { FormAssistant } from './pages/FormAssistant';
import { FormFill } from './pages/FormFill';

import { ActionCenter } from './pages/ActionCenter';
import { Cases } from './pages/Cases';
import { Insights } from './pages/Insights';
import { Help } from './pages/Help';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                {/* Public Routes */}
                <Route index element={<Landing />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="help" element={<Help />} />
                <Route path="settings" element={<Settings />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Module 1: Rights Navigator */}
                  <Route path="rights" element={<Navigate to="/rights/new" replace />} />
                  <Route path="rights/new" element={<RightsNewCase />} />
                  <Route path="rights/:id" element={<CaseDetail />} />
                  <Route path="rights/:id/analysis" element={<CaseAnalysis />} />

                  {/* Module 2: RTI Smart Builder */}
                  <Route path="rti" element={<RTIBuilder />} />
                  <Route path="rti/new" element={<RTIBuilder />} />
                  <Route path="rti/drafts" element={<RTIBuilder />} />

                  {/* Module 3: Scheme Eligibility Checker */}
                  <Route path="schemes" element={<SchemeChecker />} />
                  <Route path="schemes/check" element={<SchemeChecker />} />
                  <Route path="schemes/results" element={<SchemeResults />} />
                  <Route path="schemes/:id" element={<SchemeResults />} />

                  {/* Module 4: Guided Form Assistant */}
                  <Route path="forms" element={<FormAssistant />} />
                  <Route path="forms/:id/fill" element={<FormFill />} />

                  {/* Management Routes */}
                  <Route path="actions" element={<ActionCenter />} />
                  <Route path="cases" element={<Cases />} />
                  <Route path="cases/new" element={<RightsNewCase />} />
                  <Route path="cases/:id" element={<CaseDetail />} />
                  <Route path="cases/:id/wizard" element={<CaseWizard />} />
                  <Route path="cases/:id/analysis" element={<CaseAnalysis />} />
                  <Route path="insights" element={<Insights />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
