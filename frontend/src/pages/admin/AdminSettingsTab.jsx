import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';

export default function AdminSettingsTab({ settings, refreshAdminData }) {
  const [form, setForm] = useState({
    store_name: settings?.store_name || "Jamalpur's Market",
    support_phone: settings?.support_phone || '+91 98765 43210',
    support_email: settings?.support_email || 'support@jamalpurs.local',
    free_delivery_threshold: settings?.free_delivery_threshold || 499
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setForm(settings);
    }
  }, [settings]);

  const saveStoreSettings = async e => {
    e.preventDefault();
    try {
      await api('/admin/settings', { method: 'POST', body: JSON.stringify(form) });
      alert('Global store settings saved successfully! Title, phone, email & delivery thresholds updated across the store.');
      if (refreshAdminData) refreshAdminData();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="card-box">
      <h2>Store Global Settings</h2>
      <p className="muted margin-bottom">Updates configured here automatically change store titles, support phone numbers, support emails, and delivery threshold banners across the application.</p>
      <form onSubmit={saveStoreSettings} className="form-grid margin-top">
        <label>Store Title<input required value={form.store_name || ''} onChange={e => setForm({ ...form, store_name: e.target.value })} /></label>
        <label>Support Phone<input required value={form.support_phone || ''} onChange={e => setForm({ ...form, support_phone: e.target.value })} /></label>
        <label>Support Email<input required value={form.support_email || ''} onChange={e => setForm({ ...form, support_email: e.target.value })} /></label>
        <label>Free Delivery Threshold (₹)<input required type="number" value={form.free_delivery_threshold || ''} onChange={e => setForm({ ...form, free_delivery_threshold: e.target.value })} /></label>
        <button type="submit" className="btn-primary full-width margin-top" style={{ padding: '12px' }}>
          Save & Apply Global Settings
        </button>
      </form>
    </div>
  );
}
