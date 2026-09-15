import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { api, FALLBACK_PKG_IMG } from '../../api/apiClient';

export default function PkgEditModal({ pkg, vegs, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: pkg?.name || '',
    price: pkg?.price || '',
    total_items: pkg?.total_items || 7,
    default_items: pkg?.default_items || 3,
    description: pkg?.description || '',
    image: pkg?.image || ''
  });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (pkg && pkg.id) {
        await api(`/admin/packages/${pkg.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/admin/packages', { method: 'POST', body: JSON.stringify(form) });
      }
      onSaved();
      onClose();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        <div className="flex-between align-center">
          <h3>{pkg && pkg.id ? `Edit Special Package #${pkg.id}` : 'Create New Special Budget Package'}</h3>
          <button className="btn-icon" onClick={onClose}><XCircle size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid margin-top">
          <label className="full-width">
            Package Name *
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Weekly Family Fresh Combo" />
          </label>

          <label>
            Price (₹) *
            <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </label>

          <label>
            Total Vegetables *
            <input required type="number" value={form.total_items} onChange={e => setForm({ ...form, total_items: Number(e.target.value) })} />
          </label>

          <label>
            Fixed Default Count *
            <input required type="number" value={form.default_items} onChange={e => setForm({ ...form, default_items: Number(e.target.value) })} />
          </label>

          <label className="full-width">
            Description *
            <textarea rows={2} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </label>

          <label className="full-width">
            Image URL *
            <input required value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          </label>

          <div className="full-width flex-between margin-top">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Package</button>
          </div>
        </form>
      </div>
    </div>
  );
}
