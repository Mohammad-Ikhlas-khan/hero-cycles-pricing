import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Settings2 } from 'lucide-react';
import { fetchConfigurations, fetchParts, createConfiguration, updateConfiguration, deleteConfiguration } from '../services/api';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const CYCLE_TYPES = ['City', 'Road', 'Mountain', 'Kids', 'Hybrid', 'Folding'];
const EMPTY_FORM = { name: '', description: '', cycleType: 'City', marginPercentage: 15, partIds: [], active: true };

export default function ConfigurationsPage() {
  const [configs, setConfigs] = useState([]);
  const [allParts, setAllParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [partSearch, setPartSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchConfigurations(), fetchParts()])
      .then(([c, p]) => { setConfigs(c); setAllParts(p); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setPartSearch(''); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', cycleType: c.cycleType || 'City',
      marginPercentage: c.marginPercentage || 15, partIds: (c.parts || []).map(p => p.id), active: c.active });
    setPartSearch(''); setShowModal(true);
  };

  const togglePart = (id) => {
    setForm(f => ({
      ...f,
      partIds: f.partIds.includes(id) ? f.partIds.filter(x => x !== id) : [...f.partIds, id]
    }));
  };

  const configSubtotal = (config) =>
    (config.parts || []).reduce((s, p) => s + Number(p.price), 0);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Configuration name is required.');
    setSaving(true);
    try {
      const payload = { ...form, marginPercentage: parseFloat(form.marginPercentage) || 0 };
      if (editing) {
        await updateConfiguration(editing.id, payload);
        toast.success('Configuration updated!');
      } else {
        await createConfiguration(payload);
        toast.success('Configuration created!');
      }
      setShowModal(false); load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error saving configuration');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete configuration "${name}"?`)) return;
    try { await deleteConfiguration(id); toast.success('Configuration deleted.'); load(); }
    catch { toast.error('Could not delete configuration.'); }
  };

  const filteredParts = allParts.filter(p =>
    p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(partSearch.toLowerCase())
  );

  const selectedPartsValue = allParts
    .filter(p => form.partIds.includes(p.id))
    .reduce((s, p) => s + Number(p.price), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Configuration</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : configs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Settings2 size={40} />
            <h3>No configurations yet</h3>
            <p>Create your first cycle configuration to get started.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {configs.map(c => {
            const subtotal = configSubtotal(c);
            const margin = subtotal * (Number(c.marginPercentage) / 100);
            const total = subtotal + margin;
            return (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '18px 20px 14px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                      <span className="badge badge-blue" style={{ marginTop: 4 }}>{c.cycleType}</span>
                    </div>
                    <span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  {c.description && <p style={{ fontSize: 13, color: 'var(--steel)', marginBottom: 12 }}>{c.description}</p>}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {(c.parts || []).slice(0, 5).map(p => (
                      <span key={p.id} className="badge badge-gray" style={{ fontSize: 10 }}>{p.name}</span>
                    ))}
                    {(c.parts || []).length > 5 && (
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>+{c.parts.length - 5} more</span>
                    )}
                  </div>

                  <div style={{ background: 'var(--mist)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--steel)', marginBottom: 4 }}>
                      <span>Parts Subtotal</span><span>{INR(subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--steel)', marginBottom: 6 }}>
                      <span>Margin ({c.marginPercentage}%)</span><span>+ {INR(margin)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #e5e5ea', paddingTop: 8 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>Total Price</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--red)' }}>{INR(total)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--mist)', display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(c)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(c.id, c.name)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Configuration' : 'New Configuration'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Configuration Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. City Commuter Pro" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cycle Type</label>
                  <select className="form-input" value={form.cycleType} onChange={e => setForm(f => ({ ...f, cycleType: e.target.value }))}>
                    {CYCLE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Margin %</label>
                  <input className="form-input" type="number" min="0" max="100" value={form.marginPercentage}
                    onChange={e => setForm(f => ({ ...f, marginPercentage: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Select Parts ({form.partIds.length} selected
                  {form.partIds.length > 0 && ` · Subtotal: ₹${Number(selectedPartsValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`})
                </label>
                <input className="form-input" style={{ marginBottom: 8 }} placeholder="Search parts…"
                  value={partSearch} onChange={e => setPartSearch(e.target.value)} />
                <div className="parts-selector">
                  {filteredParts.length === 0
                    ? <div style={{ padding: 16, color: 'var(--steel)', fontSize: 13 }}>No parts found.</div>
                    : filteredParts.map(p => (
                      <div key={p.id} className={`part-option ${form.partIds.includes(p.id) ? 'selected' : ''}`}
                        onClick={() => togglePart(p.id)}>
                        <input type="checkbox" readOnly checked={form.partIds.includes(p.id)} />
                        <div className="part-option-info">
                          <div className="part-option-name">{p.name}</div>
                          <div className="part-option-cat">{p.category.replace('_', ' ')}</div>
                        </div>
                        <div className="part-option-price">₹{Number(p.price).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  Active configuration
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
