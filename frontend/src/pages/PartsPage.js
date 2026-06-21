import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { fetchParts, fetchCategories, createPart, updatePart, deletePart } from '../services/api';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const CATEGORY_COLORS = {
  FRAME: 'badge-blue', GEAR_SET: 'badge-amber', TYRE: 'badge-green',
  BRAKE: 'badge-red', HANDLEBAR: 'badge-gray', SADDLE: 'badge-gray',
  CHAIN: 'badge-amber', WHEEL: 'badge-blue', SUSPENSION: 'badge-red',
  LIGHTING: 'badge-amber', ACCESSORY: 'badge-gray', PEDAL: 'badge-gray',
};

const EMPTY_FORM = { name: '', description: '', category: 'FRAME', price: '', sku: '', supplier: '' };

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    else if (filterCat) params.category = filterCat;
    fetchParts(params).then(setParts).finally(() => setLoading(false));
  }, [search, filterCat]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchCategories().then(setCategories); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', category: p.category, price: p.price, sku: p.sku || '', supplier: p.supplier || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return toast.error('Name and price are required.');
    setSaving(true);
    try {
      if (editing) {
        await updatePart(editing.id, { ...form, price: parseFloat(form.price) });
        toast.success('Part updated!');
      } else {
        await createPart({ ...form, price: parseFloat(form.price) });
        toast.success('Part created!');
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error saving part');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete part "${name}"? This cannot be undone.`)) return;
    try {
      await deletePart(id);
      toast.success('Part deleted.');
      load();
    } catch (e) { toast.error('Could not delete part.'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--steel)' }} />
          <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search parts…"
            value={search} onChange={e => { setSearch(e.target.value); setFilterCat(''); }} />
        </div>
        <select className="form-input" style={{ width: 180 }} value={filterCat}
          onChange={e => { setFilterCat(e.target.value); setSearch(''); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Part</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : parts.length === 0 ? (
            <div className="empty-state">
              <Package size={40} />
              <h3>No parts found</h3>
              <p>Add your first part to get started.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Part Name</th><th>Category</th><th>SKU</th><th>Supplier</th>
                  <th style={{ textAlign: 'right' }}>Price</th><th>Updated</th><th></th>
                </tr>
              </thead>
              <tbody>
                {parts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: 12, color: 'var(--steel)', marginTop: 2 }}>{p.description}</div>}
                    </td>
                    <td><span className={`badge ${CATEGORY_COLORS[p.category] || 'badge-gray'}`}>{p.category.replace('_', ' ')}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--steel)' }}>{p.sku || '—'}</td>
                    <td style={{ fontSize: 13 }}>{p.supplier || '—'}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{INR(p.price)}</td>
                    <td style={{ fontSize: 12, color: 'var(--steel)' }}>{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(p.id, p.name)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Part' : 'Add New Part'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Part Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Shimano 21-Speed Gear Set" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. FRM-AL-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input className="form-input" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="e.g. Shimano India" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional details about this part" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Part'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
