import React, { useState } from 'react';
import { api } from '../../api/apiClient';

export default function AdminBranchesTab({ branches, refreshAdminData }) {
  const [newBranch, setNewBranch] = useState({ name: '', location: '', phone: '' });

  const addBranch = async e => {
    e.preventDefault();
    try {
      await api('/admin/branches', { method: 'POST', body: JSON.stringify(newBranch) });
      setNewBranch({ name: '', location: '', phone: '' });
      refreshAdminData();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="admin-section">
      <h2>Store Outlets & Branch Locations</h2>
      <form onSubmit={addBranch} className="form-grid card-box margin-top">
        <h4>Add Store Branch Outlet</h4>
        <label>Branch Name *<input required value={newBranch.name} onChange={e => setNewBranch({ ...newBranch, name: e.target.value })} placeholder="Jamalpur Market Main" /></label>
        <label>Location *<input required value={newBranch.location} onChange={e => setNewBranch({ ...newBranch, location: e.target.value })} placeholder="Hyderabad Central" /></label>
        <label>Phone<input value={newBranch.phone} onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })} placeholder="+91 9876543210" /></label>
        <button className="btn-primary margin-top">Add Store Branch</button>
      </form>

      <div className="table-responsive margin-top">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Branch</th><th>Location</th><th>Phone</th><th>Status</th></tr></thead>
          <tbody>
            {branches.map(b => (
              <tr key={b.id}>
                <td>#{b.id}</td><td><b>{b.name}</b></td><td>{b.location}</td><td>{b.phone}</td><td><span className="status-badge in-stock">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
