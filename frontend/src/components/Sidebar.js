import React from 'react';
import { LayoutDashboard, Wrench, Settings2, IndianRupee } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'parts', label: 'Parts Catalogue', icon: Wrench },
  { id: 'configurations', label: 'Configurations', icon: Settings2 },
  { id: 'pricing', label: 'Pricing Engine', icon: IndianRupee },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">
          <div className="logo-mark">H</div>
          <div className="brand-text">
            <div className="company">HERO CYCLES</div>
            <div className="tagline">Pricing Engine</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon />
            {label}
          </div>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 11, color: 'var(--steel)' }}>v1.0.0 — Beta</div>
        <div style={{ fontSize: 11, color: 'var(--steel)', marginTop: 2 }}>© Hero Cycles Ltd.</div>
      </div>
    </aside>
  );
}
