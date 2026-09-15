import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import { api } from '../api/apiClient';
import AddressModal from '../components/modals/AddressModal';

export default function UserAddressesPage({ user }) {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAddresses = () => {
    if (!user) {
      navigate('/login?redirect=/addresses');
      return;
    }
    api('/user/addresses')
      .then(setAddresses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const handleDelete = async id => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      await api(`/user/addresses/${id}`, { method: 'DELETE' });
      loadAddresses();
    } catch (err) { alert(err.message); }
  };

  const handleSetDefault = async id => {
    try {
      await api(`/user/addresses/${id}/default`, { method: 'PUT' });
      loadAddresses();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="page-container narrow margin-top" style={{ maxWidth: '850px' }}>
      <button className="btn-outline-sm margin-bottom" onClick={() => navigate('/profile')}>
        <ArrowLeft size={16} /> Back to Account Overview
      </button>

      <div className="card-box flex-between align-center">
        <div>
          <h2>My Saved Delivery Addresses ({addresses.length})</h2>
          <p className="muted">Manage multiple delivery locations (Home, Office, Farm, etc.).</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditingAddr(null);
          setShowModal(true);
        }}>
          <Plus size={16} /> Add New Address
        </button>
      </div>

      {loading ? (
        <p className="muted margin-top">Loading saved addresses...</p>
      ) : addresses.length === 0 ? (
        <div className="empty-box card-box margin-top" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <MapPin size={48} className="muted" />
          <h3>No Delivery Addresses Saved</h3>
          <p className="muted">Add a delivery address for express 2-hour checkout.</p>
          <button className="btn-primary margin-top" onClick={() => setShowModal(true)}>Add Address Now</button>
        </div>
      ) : (
        <div className="grid-2-cols margin-top">
          {addresses.map(addr => (
            <div key={addr.id} className="card-box" style={{ border: addr.is_default ? '2px solid #059669' : '1px solid #e2e8f0' }}>
              <div className="flex-between align-center">
                <span className="badge-admin" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                  {addr.tag === 'Home' ? '🏠 Home' : addr.tag === 'Office' ? '🏢 Office' : addr.tag === 'Farm' ? '🌾 Farm' : '📍 ' + addr.tag}
                </span>
                {addr.is_default ? (
                  <span className="badge-admin" style={{ background: '#059669', color: '#ffffff' }}>Default Delivery</span>
                ) : (
                  <button className="btn-outline-sm" onClick={() => handleSetDefault(addr.id)}>Set Default</button>
                )}
              </div>

              <div className="margin-top">
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{addr.name || user?.name}</strong>
                <p className="muted" style={{ margin: '6px 0' }}>{addr.address}</p>
                <p className="muted"><b>City:</b> {addr.city} • <b>PIN:</b> {addr.pin}</p>
                <p className="muted"><b>Phone:</b> {addr.phone || user?.phone || 'N/A'}</p>
              </div>

              <div className="flex-between margin-top" style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button className="btn-outline-sm" onClick={() => {
                  setEditingAddr(addr);
                  setShowModal(true);
                }}>
                  <Edit3 size={14} /> Edit
                </button>
                <button className="btn-outline-sm" style={{ color: '#ef4444', borderColor: '#fecdd3' }} onClick={() => handleDelete(addr.id)}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddressModal
          user={user}
          editingAddress={editingAddr}
          onClose={() => setShowModal(false)}
          onSaved={loadAddresses}
        />
      )}
    </div>
  );
}
