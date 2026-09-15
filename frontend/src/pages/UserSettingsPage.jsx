import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Lock, Trash2, ArrowLeft } from 'lucide-react';
import { api } from '../api/apiClient';

export default function UserSettingsPage({ user, onUpdated, onLogout }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    pin: user?.pin || ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteErr, setDeleteErr] = useState('');

  const handleSaveProfile = async e => {
    e.preventDefault();
    try {
      const updated = await api('/auth/profile', { method: 'PUT', body: JSON.stringify(form) });
      onUpdated(updated);
      alert('Personal details saved successfully!');
    } catch (e) { alert(e.message); }
  };

  const handleDeleteAccount = async e => {
    e.preventDefault();
    setDeleteErr('');
    try {
      await api('/auth/delete-account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword })
      });
      if (confirm("Are you confirming to delete your RRV Trades account permanently?")) {

        alert("Your account has been deleted.");
        onLogout();
        navigate('/');
      }
    } catch (e) { setDeleteErr(e.message); }
  };

  return (
    <div className="page-container narrow margin-top" style={{ maxWidth: '800px' }}>
      <button className="btn-outline-sm margin-bottom" onClick={() => navigate('/profile')}>
        <ArrowLeft size={16} /> Back to Account Overview
      </button>

      <div className="card-box">
        <div className="flex-between align-center">
          <h3>Edit Personal Profile & Account Settings</h3>
          <button className="btn-outline-sm" onClick={() => navigate('/addresses')}>
            <MapPin size={14} /> Manage Saved Addresses &rarr;
          </button>
        </div>
        <p className="muted margin-top">Update your personal profile, primary billing address & account security credentials.</p>

        <form onSubmit={handleSaveProfile} className="form-grid margin-top">
          <label className="full-width">
            Full Name *
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Email Address (Account ID)
            <input disabled value={form.email} />
          </label>
          <label>
            Phone Number
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="full-width">
            Primary Delivery Address *
            <textarea rows={2} required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </label>
          <label>
            City *
            <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          </label>
          <label>
            Pincode *
            <input required value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} />
          </label>

          <div className="full-width flex-between margin-top">
            <button type="button" className="btn-secondary danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={16} /> Delete Account
            </button>
            <button type="submit" className="btn-primary">Save Profile Details</button>
          </div>
        </form>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <h3 style={{ color: '#ef4444' }}>Delete Account Permanently</h3>
            <p className="muted margin-top" style={{ fontSize: '0.9rem' }}>
              Warning: Deleting your account will permanently wipe your saved delivery addresses, order history, and account credentials.
            </p>
            {deleteErr && <div className="alert-box-card danger margin-top">{deleteErr}</div>}
            <form onSubmit={handleDeleteAccount} className="margin-top">
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>
                Confirm Account Password *
                <input required type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Password..." style={{ width: '100%', marginTop: '4px' }} />
              </label>
              <div className="flex-between margin-top">
                <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary danger">Confirm Permanent Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
