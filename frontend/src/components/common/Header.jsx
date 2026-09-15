import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, ShieldCheck, LogOut } from 'lucide-react';

export default function Header({ cartCount, user, search, setSearch, onLogout, settings = {} }) {
  const navigate = useNavigate();
  const storeName = settings.store_name || "RRV Trades";


  return (
    <header className="main-header">
      <div className="header-inner">
        {/* Brand Logo - textDecoration: none explicitly applied */}
        <Link to="/" className="brand" style={{ textDecoration: 'none', borderBottom: 'none' }}>
          <div className="brand-logo">
            <img src="/logo.png" alt={storeName} style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div>
            <span className="brand-name" style={{ textDecoration: 'none' }}>{storeName}</span>
            <span className="brand-sub" style={{ textDecoration: 'none' }}>VEGETABLE MARKET</span>
          </div>
        </Link>

        {/* Global Search Bar (Hidden on Mobile screens <=768px via CSS) */}
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search fresh vegetables..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Action Buttons (Hidden on Mobile screens <=768px via CSS, as controls are in mobile bottom nav) */}
        <div className="head-actions">
          {user && user.role === 'admin' ? (
            /* Admin Header View */
            <div className="user-avatar-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="admin-btn" onClick={() => navigate('/admin')} title="Open Admin Panel">
                <ShieldCheck size={16} /> Admin Panel
              </button>
              <button className="icon-action-btn" onClick={onLogout} title="Sign Out Admin">
                <LogOut size={16} />
              </button>
            </div>
          ) : user ? (
            /* Customer Logged In View */
            <div className="user-avatar-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="user-profile-avatar-btn" onClick={() => navigate('/profile')}>
                <div className="avatar-circle">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </button>
              <button className="icon-action-btn" onClick={onLogout} title="Sign Out">
                <LogOut size={16} />
              </button>
              <button className="cart-btn" onClick={() => navigate('/cart')}>
                <ShoppingCart size={18} />
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </div>
          ) : (
            /* Guest View */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="auth-btn" onClick={() => navigate('/login')}>
                <User size={16} /> Sign In
              </button>
              <button className="cart-btn" onClick={() => navigate('/cart')}>
                <ShoppingCart size={18} />
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
