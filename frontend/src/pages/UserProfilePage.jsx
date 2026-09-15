import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, MapPin, Award, Phone, User, Lock, ShieldCheck, Trash2, LogOut, ChevronRight } from 'lucide-react';
import { api } from '../api/apiClient';

export default function UserProfilePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }
    api('/orders').then(setOrders).catch(console.error);
    api('/user/addresses').then(setAddresses).catch(console.error);
  }, [user]);

  if (!user) return null;

  return (
    <div className="concept-profile-page page-container narrow margin-top" style={{ maxWidth: '850px' }}>
      {/* Profile Header Cover Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-xl">
          {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
        </div>
        <div className="profile-header-details">
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <small className="profile-address-sub">
            <MapPin size={13} inline="true" /> {user.address ? `${user.address}, ${user.city} (${user.pin})` : 'Delivery location not set'}
          </small>
        </div>
      </div>

      {/* QUICK ACTIONS 2x2 GRID */}
      <div className="profile-quick-actions-section margin-top">
        <span className="section-eyebrow-label">QUICK ACTIONS</span>
        <div className="quick-actions-2x2-grid margin-top">
          <div className="quick-action-card" onClick={() => navigate('/orders')}>
            <div className="quick-icon-wrap emerald"><Package size={22} /></div>
            <div>
              <strong>Orders</strong>
              <small>{orders.length} Placed</small>
            </div>
          </div>

          <div className="quick-action-card" onClick={() => navigate('/addresses')}>
            <div className="quick-icon-wrap blue"><MapPin size={22} /></div>
            <div>
              <strong>Delivery Address</strong>
              <small>{addresses.length > 0 ? `${addresses.length} Saved` : (user.city || 'Set Address')}</small>
            </div>
          </div>

          <div className="quick-action-card" onClick={() => alert('Free delivery on all orders above ₹499!')}>
            <div className="quick-icon-wrap amber"><Award size={22} /></div>
            <div>
              <strong>Store Offers</strong>
              <small>Free Delivery &gt; ₹499</small>
            </div>
          </div>

          <div className="quick-action-card" onClick={() => alert('Support helpline: +91 98765 43210 (24x7)')}>
            <div className="quick-icon-wrap sky"><Phone size={22} /></div>
            <div>
              <strong>Help Center</strong>
              <small>24x7 Support</small>
            </div>
          </div>
        </div>
      </div>

      {/* ACCOUNT SETTINGS LIST CARD */}
      <div className="card-box margin-top">
        <span className="section-eyebrow-label">ACCOUNT SETTINGS</span>
        <div className="account-settings-list margin-top">
          <button className="setting-list-item" onClick={() => navigate('/settings')}>
            <div className="setting-item-left">
              <User size={18} />
              <div>
                <strong>Edit Personal Profile Details</strong>
                <small>Edit name, phone, primary delivery address & pincode</small>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>

          <button className="setting-list-item" onClick={() => navigate('/addresses')}>
            <div className="setting-item-left">
              <MapPin size={18} />
              <div>
                <strong>Saved Delivery Addresses & More Addresses ({addresses.length})</strong>
                <small>Manage multiple delivery locations (Home, Office, Farm, etc.)</small>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>

          <button className="setting-list-item" onClick={() => navigate('/orders')}>
            <div className="setting-item-left">
              <Package size={18} />
              <div>
                <strong>Order History & Tax Invoices ({orders.length})</strong>
                <small>View past orders, track delivery status & print invoices</small>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>

          {user.role === 'admin' && (
            <button className="setting-list-item admin-item" onClick={() => navigate('/admin')}>
              <div className="setting-item-left">
                <ShieldCheck size={18} />
                <div>
                  <strong>Open Admin Dashboard</strong>
                  <small>Manage vegetables, orders & packages</small>
                </div>
              </div>
              <ChevronRight size={16} />
            </button>
          )}

          <button className="setting-list-item danger-item" onClick={onLogout}>
            <div className="setting-item-left">
              <LogOut size={18} />
              <div>
                <strong>Sign Out Account</strong>
                <small>Log out of current session</small>
              </div>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
