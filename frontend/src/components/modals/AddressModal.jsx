import React, { useState } from 'react';
import { XCircle, MapPin } from 'lucide-react';
import { api } from '../../api/apiClient';

export default function AddressModal({ user, editingAddress, onClose, onSaved }) {
  const [form, setForm] = useState({
    tag: editingAddress?.tag || 'Home',
    name: editingAddress?.name || user?.name || '',
    phone: editingAddress?.phone || user?.phone || '',
    address: editingAddress?.address || '',
    city: editingAddress?.city || user?.city || 'Hyderabad',
    pin: editingAddress?.pin || user?.pin || '',
    is_default: editingAddress ? !!editingAddress.is_default : false
  });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api(`/user/addresses/${editingAddress.id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/user/addresses', { method: 'POST', body: JSON.stringify(form) });
      }
      onSaved();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <div className="flex-between align-center">
          <h3>{editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h3>
          <button className="btn-icon" onClick={onClose}><XCircle size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid margin-top">
          <label>
            Address Label Tag *
            <select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}>
              <option value="Home">Home 🏠</option>
              <option value="Office">Office 🏢</option>
              <option value="Farm">Farm 🌾</option>
              <option value="Other">Other 📍</option>
            </select>
          </label>

          <label>
            Contact Person Name *
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </label>

          <label className="full-width">
            Phone Number *
            <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </label>

          <label className="full-width">
            Complete Street Address *
            <textarea rows={2} required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House/Flat No., Street, Area..." />
          </label>

          <label>
            City *
            <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          </label>

          <label>
            Pincode *
            <input required value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} />
          </label>

          <label className="full-width flex align-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '4px 0' }}>
            <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
            <span>Set as Default Primary Delivery Address</span>
          </label>

          <div className="full-width flex-between margin-top">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Delivery Address</button>
          </div>
        </form>
      </div>
    </div>
  );
}
