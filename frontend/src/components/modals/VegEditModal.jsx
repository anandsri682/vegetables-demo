import React, { useState } from 'react';
import { XCircle, Upload } from 'lucide-react';
import { api, FALLBACK_VEG_IMG } from '../../api/apiClient';

export default function VegEditModal({ veg, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: veg?.name || '',
    category_id: veg?.category_id || (categories[0]?.id || 1),
    price: veg?.price || '',
    unit: veg?.unit || 'kg',
    stock: veg?.stock || 50,
    availability: veg?.availability || 'Available',
    image: veg?.image || '',
    organic: veg ? !!veg.organic : true
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.image.trim()) {
      alert('Vegetable Product Image URL is required');
      return;
    }
    try {
      if (veg && veg.id) {
        await api(`/admin/vegetables/${veg.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/admin/vegetables', { method: 'POST', body: JSON.stringify(form) });
      }
      onSaved();
      onClose();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        <div className="flex-between align-center">
          <h3>{veg && veg.id ? `Edit Vegetable #${veg.id}` : 'Add New Vegetable Product'}</h3>
          <button className="btn-icon" onClick={onClose}><XCircle size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid margin-top">
          <label className="full-width">
            Vegetable Title *
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fresh Tomatoes, Hybrid Potatoes..." />
          </label>

          <label>
            Category *
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: Number(e.target.value) })}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label>
            Unit Price (₹) *
            <input required type="number" step="0.5" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </label>

          <label>
            Unit of Measure *
            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
              <option value="kg">Per kg</option>
              <option value="bunch">Per bunch</option>
              <option value="piece">Per piece</option>
              <option value="pack">Per 250g pack</option>
            </select>
          </label>

          <label>
            Stock Quantity *
            <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
          </label>

          <label className="full-width">
            Image URL *
            <input required value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          </label>

          {form.image && (
            <div className="full-width" style={{ textAlign: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
              <img src={form.image} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }} onError={e => e.target.src = FALLBACK_VEG_IMG} />
            </div>
          )}

          <div className="full-width flex-between margin-top">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Vegetable Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
