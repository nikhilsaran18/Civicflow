import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { MobileNav } from '../common/MobileNav';
import { Footer } from '../common/Footer';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${isAuthenticated ? 'pb-24 lg:pb-8' : ''}`}>
          <Outlet />
        </main>
      </div>

      {isAuthenticated && <MobileNav />}
      <Footer />
    </div>
  );
};
