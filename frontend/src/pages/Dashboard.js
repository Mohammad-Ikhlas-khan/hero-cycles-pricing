import React, { useEffect, useState } from 'react';
import { fetchParts, fetchConfigurations } from '../services/api';
import { Wrench, Settings2, IndianRupee, TrendingUp } from 'lucide-react';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard({ onNavigate }) {
  const [parts, setParts] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchParts(), fetchConfigurations()])
      .then(([p, c]) => { setParts(p); setConfigs(c); })
      .finally(() => setLoading(false));
  }, []);

  const totalPartsValue = parts.reduce((s, p) => s + Number(p.price), 0);
  const avgConfigParts = configs.length
    ? Math.round(configs.reduce((s, c) => s + (c.parts?.length || 0), 0) / configs.length)
    : 0;

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--charcoal) 0%, var(--graphite) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)', color: 'white', overflow: 'hidden', position: 'relative'
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(212,36,26,0.12)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '0.02em' }}>
            Good day, Sales Team 👋
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6, maxWidth: 480 }}>
            Manage parts, build cycle configurations, and get instant price breakdowns — no more Excel sheets.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Parts</div>
          {loading ? <div className="stat-value">—</div> : (
            <>
              <div className="stat-value">{parts.length}</div>
              <div className="stat-sub">across {new Set(parts.map(p => p.category)).size} categories</div>
            </>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Configurations</div>
          {loading ? <div className="stat-value">—</div> : (
            <>
              <div className="stat-value">{configs.length}</div>
              <div className="stat-sub">active builds</div>
            </>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Parts / Config</div>
          {loading ? <div className="stat-value">—</div> : (
            <>
              <div className="stat-value">{avgConfigParts}</div>
              <div className="stat-sub">components per cycle</div>
            </>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Parts Value</div>
          {loading ? <div className="stat-value">—</div> : (
            <>
              <div className="stat-value" style={{ fontSize: 22 }}>{INR(totalPartsValue)}</div>
              <div className="stat-sub">catalogue base cost</div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Configurations</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('configurations')}>View all</button>
          </div>
          <div className="card-body">
            {loading ? <div className="loading"><div className="spinner" /></div> : configs.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <p>No configurations yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {configs.slice(0, 4).map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--mist)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--steel)', marginTop: 2 }}>
                        {c.parts?.length || 0} parts · {c.cycleType}
                      </div>
                    </div>
                    <span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: IndianRupee, label: 'Calculate Price Breakdown', sub: 'Get instant pricing for any config', page: 'pricing', color: 'var(--red)' },
              { icon: Settings2,   label: 'Build New Configuration',    sub: 'Combine parts into a cycle spec', page: 'configurations', color: '#1A73E8' },
              { icon: Wrench,      label: 'Add New Part',               sub: 'Update the parts catalogue', page: 'parts', color: var_green },
              { icon: TrendingUp,  label: 'Update Part Prices',         sub: 'Reflect latest supplier costs', page: 'parts', color: 'var(--accent)' },
            ].map(({ icon: Icon, label, sub, page, color }) => (
              <button key={label} className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12, padding: '10px 14px', textAlign: 'left' }}
                onClick={() => onNavigate(page)}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--steel)', marginTop: 1 }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const var_green = 'var(--green)';
