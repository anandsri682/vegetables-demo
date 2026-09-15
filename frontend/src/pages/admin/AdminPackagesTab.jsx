import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { money, getImageUrl, api, FALLBACK_PKG_IMG } from '../../api/apiClient';
import PkgEditModal from '../../components/modals/PkgEditModal';

export default function AdminPackagesTab({ packages, vegs, refreshAdminData }) {
  const [editingPkg, setEditingPkg] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const deletePkg = async id => {
    if (!confirm('Delete this package?')) return;
    try {
      await api(`/admin/packages/${id}`, { method: 'DELETE' });
      refreshAdminData();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="admin-section">
      <div className="flex-between align-center">
        <div>
          <h2>Special Budget Packages Setup</h2>
          <p className="muted">Configure fixed default items and customizable vegetable pools.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingPkg({}); setShowModal(true); }}>
          <Plus size={16} /> Create Custom Package
        </button>
      </div>

      <div className="table-responsive margin-top">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Package Title</th>
              <th>Target Price</th>
              <th>Total Items</th>
              <th>Default Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(p => (
              <tr key={p.id}>
                <td><img src={getImageUrl(p.image, FALLBACK_PKG_IMG)} alt={p.name} className="admin-table-img" /></td>
                <td><b>{p.name}</b></td>
                <td><b>{money(p.price)}</b></td>
                <td>{p.total_items} Items</td>
                <td>{p.default_items} Defaults</td>
                <td>
                  <div className="action-btns-flex">
                    <button className="btn-icon" onClick={() => { setEditingPkg(p); setShowModal(true); }}><Edit3 size={14} /></button>
                    <button className="btn-icon danger" onClick={() => deletePkg(p.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <PkgEditModal
          pkg={editingPkg}
          vegs={vegs}
          onClose={() => setShowModal(false)}
          onSaved={refreshAdminData}
        />
      )}
    </div>
  );
}
