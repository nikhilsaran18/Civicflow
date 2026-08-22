import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { Landing } from './pages/Landing';
import { NewCase } from './pages/NewCase';
import { CaseDetail } from './pages/CaseDetail';
import { DocumentGenerator } from './pages/DocumentGenerator';
import { Cases } from './pages/Cases';

import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { FormAssistant } from './pages/FormAssistant';
import { FormFill } from './pages/FormFill';
import { SchemeChecker } from './pages/SchemeChecker';
import { SchemeResults } from './pages/SchemeResults';
import { RTIBuilder } from './pages/RTIBuilder';
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
                <Route path="register" element={<Login defaultTab="register" />} />
                <Route path="help" element={<Help />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="settings" element={<Settings />} />

                  {/* Core Case Workflows */}
                  <Route path="case/new" element={<NewCase />} />
                  <Route path="cases/new" element={<NewCase />} />
                  <Route path="case/:id" element={<CaseDetail />} />
                  <Route path="cases/:id" element={<CaseDetail />} />
                  <Route path="case/:id/document/:documentId" element={<DocumentGenerator />} />
                  <Route path="cases" element={<Cases />} />

                  {/* Auxiliary Empowering Tools */}
                  <Route path="forms" element={<FormAssistant />} />
                  <Route path="forms/:id/fill" element={<FormFill />} />
                  <Route path="schemes" element={<SchemeChecker />} />
                  <Route path="schemes/results" element={<SchemeResults />} />
                  <Route path="rti" element={<RTIBuilder />} />
                  <Route path="rti/new" element={<RTIBuilder />} />
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
