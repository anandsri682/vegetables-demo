import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { money, getImageUrl, api } from '../../api/apiClient';
import PaginationBar from '../../components/common/PaginationBar';
import VegEditModal from '../../components/modals/VegEditModal';

export default function AdminVegetablesTab({ vegs, categories, refreshAdminData }) {
  const location = useLocation();
  const [vegPage, setVegPage] = useState(1);
  const [editingVeg, setEditingVeg] = useState(null);
  const [showModal, setShowModal] = useState(location.pathname === '/admin/products/new');

  useEffect(() => {
    if (location.pathname === '/admin/products/new') {
      setEditingVeg({});
      setShowModal(true);
    }
  }, [location]);

  const updateVegAvailability = async (id, availability) => {
    try {
      const v = vegs.find(x => x.id === id);
      if (!v) return;
      await api(`/admin/vegetables/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...v, availability, stock: availability === 'Available' ? (v.stock > 0 ? v.stock : 50) : 0 })
      });
      refreshAdminData();
    } catch (e) { alert(e.message); }
  };

  const deleteVeg = async id => {
    if (!confirm('Delete this vegetable product?')) return;
    try {
      await api(`/admin/vegetables/${id}`, { method: 'DELETE' });
      refreshAdminData();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="admin-section">
      <div className="flex-between align-center">
        <div>
          <h2>Vegetable Products Management</h2>
          <p className="muted">Add, edit, or remove single vegetables. Set product availability and upload mandatory images.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingVeg({}); setShowModal(true); }}>
          <Plus size={16} /> Add New Vegetable
        </button>
      </div>

      <div className="table-responsive margin-top">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Vegetable Name</th>
              <th>Category</th>
              <th>Price / Unit</th>
              <th>Stock Quantity</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vegs.slice((vegPage - 1) * 10, vegPage * 10).map(v => (
              <tr key={v.id}>
                <td><img src={getImageUrl(v.image)} alt={v.name} className="admin-table-img" /></td>
                <td><b>{v.name}</b></td>
                <td>{v.category_name}</td>
                <td><b>{money(v.price)}</b> / {v.unit}</td>
                <td>{v.stock} {v.unit}</td>
                <td>
                  <select
                    value={v.availability}
                    onChange={e => updateVegAvailability(v.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid #e2e8f0',
                      background: v.availability === 'Available' ? '#ecfdf5' : '#fff1f2',
                      color: v.availability === 'Available' ? '#059669' : '#e11d48',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Not Available</option>
                  </select>
                </td>
                <td>
                  <div className="action-btns-flex">
                    <button className="btn-icon" onClick={() => { setEditingVeg(v); setShowModal(true); }} title="Edit Vegetable"><Edit3 size={14} /></button>
                    <button className="btn-icon danger" onClick={() => deleteVeg(v.id)} title="Delete Vegetable"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationBar currentPage={vegPage} totalItems={vegs.length} pageSize={10} onPageChange={setVegPage} />
      </div>

      {showModal && (
        <VegEditModal
          veg={editingVeg}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={refreshAdminData}
        />
      )}
    </div>
  );
}
