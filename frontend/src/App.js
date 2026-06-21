import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PartsPage from './pages/PartsPage';
import ConfigurationsPage from './pages/ConfigurationsPage';
import PricingPage from './pages/PricingPage';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    parts: <PartsPage />,
    configurations: <ConfigurationsPage />,
    pricing: <PricingPage />,
  };

  const titles = {
    dashboard: 'Dashboard',
    parts: 'Parts Catalogue',
    configurations: 'Cycle Configurations',
    pricing: 'Pricing Engine',
  };

  return (
    <div className="app-shell">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: 14, borderRadius: 10 },
          success: { iconTheme: { primary: '#30A84B', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#D4241A', secondary: '#fff' } },
        }}
      />
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{titles[page]}</span>
          <div className="topbar-right">
            <span style={{ fontSize: 13, color: 'var(--steel)' }}>Hero Cycles Digital</span>
          </div>
        </header>
        <main className="page-body">{pages[page]}</main>
      </div>
    </div>
  );
}
