import React, { useEffect, useState } from 'react';
import { fetchConfigurations, fetchPriceBreakdown } from '../services/api';
import { IndianRupee, ChevronDown, Layers } from 'lucide-react';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CATEGORY_ICONS = {
  FRAME: '🚲', GEAR_SET: '⚙️', TYRE: '🔵', BRAKE: '🔴', HANDLEBAR: '🏹',
  SADDLE: '🪑', CHAIN: '🔗', WHEEL: '⭕', SUSPENSION: '🔧', LIGHTING: '💡',
  ACCESSORY: '🎒', PEDAL: '👣',
};

export default function PricingPage() {
  const [configs, setConfigs] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingConfigs, setLoadingConfigs] = useState(true);

  useEffect(() => {
    fetchConfigurations()
      .then(data => { setConfigs(data); if (data.length > 0) setSelectedId(String(data[0].id)); })
      .finally(() => setLoadingConfigs(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setBreakdown(null); return; }
    setLoading(true);
    setBreakdown(null);
    fetchPriceBreakdown(selectedId)
      .then(setBreakdown)
      .finally(() => setLoading(false));
  }, [selectedId]);

  // Group parts by category for the breakdown display
  const byCategory = breakdown
    ? breakdown.partPrices.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
      }, {})
    : {};

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Config Selector */}
      <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--steel)', marginBottom: 8 }}>Select Cycle Configuration</div>
            <div style={{ position: 'relative' }}>
              <select className="form-input" style={{ appearance: 'none', paddingRight: 36, fontSize: 16, fontWeight: 600 }}
                value={selectedId} onChange={e => setSelectedId(e.target.value)} disabled={loadingConfigs}>
                {loadingConfigs
                  ? <option>Loading…</option>
                  : configs.length === 0
                    ? <option value="">No configurations available</option>
                    : configs.map(c => <option key={c.id} value={c.id}>{c.name} ({c.cycleType})</option>)
                }
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--steel)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', minWidth: 160 }}>
            {breakdown && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Price</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--red)', lineHeight: 1.1 }}>
                  {INR(breakdown.totalPrice)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="loading"><div className="spinner" /></div>}

      {!loading && breakdown && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          {/* Left: Parts breakdown by category */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Component Breakdown — {breakdown.partPrices.length} parts
            </div>
            {Object.entries(byCategory).map(([cat, parts]) => (
              <div key={cat} className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: 'var(--mist)', borderBottom: '1px solid #e5e5ea'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}>
                    <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[cat] || '🔧'}</span>
                    {cat.replace('_', ' ')}
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--charcoal)' }}>
                    {INR(breakdown.categorySubtotals[cat])}
                  </span>
                </div>
                {parts.map(p => (
                  <div key={p.partId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid var(--mist)' }}>
                    <span style={{ fontSize: 14 }}>{p.partName}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{INR(p.unitPrice)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Right: Summary panel */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Price Summary
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ marginBottom: 20 }}>
                {Object.entries(breakdown.categorySubtotals).map(([cat, val]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, borderBottom: '1px solid var(--mist)' }}>
                    <span style={{ color: 'var(--steel)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>{CATEGORY_ICONS[cat] || '🔧'}</span>{cat.replace('_', ' ')}
                    </span>
                    <span style={{ fontWeight: 600 }}>{INR(val)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ background: 'var(--mist)', borderRadius: 8, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                  <span style={{ color: 'var(--steel)' }}>Parts Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{INR(breakdown.partsSubtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}>
                  <span style={{ color: 'var(--steel)' }}>Margin ({breakdown.marginPercentage}%)</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent)' }}>+ {INR(breakdown.marginAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid #e5e5ea' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--red)' }}>
                    {INR(breakdown.totalPrice)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: 12, background: 'var(--green-bg)', borderRadius: 8, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                ✓ Price reflects current catalogue costs. Last updated: {new Date().toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !breakdown && !loadingConfigs && configs.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <Layers size={40} />
            <h3>No configurations available</h3>
            <p>Create a cycle configuration to generate pricing.</p>
          </div>
        </div>
      )}
    </div>
  );
}
