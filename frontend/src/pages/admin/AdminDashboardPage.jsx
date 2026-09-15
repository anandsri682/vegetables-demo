import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Grid, Box, ShoppingCart, Package, Truck, Users, Bell, Settings,
  Store, RefreshCw, LogOut, Eye, ShieldCheck, Sliders, XCircle
} from 'lucide-react';
import { api } from '../../api/apiClient';
import AdminOverviewTab from './AdminOverviewTab';
import AdminVegetablesTab from './AdminVegetablesTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminPackagesTab from './AdminPackagesTab';
import AdminBranchesTab from './AdminBranchesTab';
import AdminCustomersTab from './AdminCustomersTab';
import AdminSettingsTab from './AdminSettingsTab';
import AdminNotificationsTab from './AdminNotificationsTab';

export default function AdminDashboardPage({ user, refreshMainData, onViewInvoice, onViewLabel, onLogout, onViewOrderDetails }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [vegs, setVegs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Sync current active tab with URL path
  const getTabFromPath = path => {
    if (path.startsWith('/admin/products')) return 'vegetables';
    if (path.startsWith('/admin/orders')) return 'orders';
    if (path.startsWith('/admin/packages')) return 'packages';
    if (path.startsWith('/admin/branches')) return 'branches';
    if (path.startsWith('/admin/customers')) return 'customers';
    if (path.startsWith('/admin/settings')) return 'settings';
    if (path.startsWith('/admin/notifications')) return 'notifications';
    return 'overview';
  };

  const tab = getTabFromPath(location.pathname);

  const loadAdminData = async () => {
    try {
      const statsData = await api('/admin/stats').catch(() => null);
      const ordersData = await api('/admin/orders').catch(e => { console.error('Admin orders error:', e); return []; });
      const vegsData = await api('/vegetables').catch(() => []);
      const pkgsData = await api('/admin/packages').catch(() => []);
      const branchesData = await api('/admin/branches').catch(() => []);
      const custData = await api('/admin/customers').catch(() => []);
      const settingsData = await api('/admin/settings').catch(() => ({}));
      const notifsData = await api('/admin/notifications').catch(() => []);

      if (statsData) setStats(statsData);
      setOrders(ordersData || []);
      setVegs(vegsData || []);
      setPackages(pkgsData || []);
      setBranches(branchesData || []);
      setCustomers(custData || []);
      setSettings(settingsData || {});
      setNotifications(notifsData || []);
      if (refreshMainData) refreshMainData();
    } catch (e) {
      console.error('Failed loading admin data:', e);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(() => {
      loadAdminData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="page-container narrow margin-top" style={{ maxWidth: '500px', margin: '60px auto' }}>
        <div className="card-box" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ width: 64, height: 64, background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ color: '#0f172a', margin: '8px 0' }}>Admin Login Required</h2>
          <p className="muted" style={{ fontSize: '0.9rem', margin: '8px 0 20px 0' }}>
            Please sign in with Store Admin credentials to access live analytics, products, and customer orders.
          </p>

          <div className="card-box" style={{ background: '#f8fafc', padding: '14px', textAlign: 'left', borderRadius: '10px', fontSize: '0.85rem' }}>
            <div><b>Admin Email:</b> admin@jamalpurs.local</div>
            <div style={{ marginTop: '4px' }}><b>Password:</b> Admin@123</div>
          </div>

          <button
            className="btn-primary full-width margin-top"
            onClick={() => navigate('/login')}
          >
            Sign In with Admin Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="freshcart-admin-app">
      {/* Mobile Top Header */}
      <header className="freshcart-admin-mobile-header mobile-only">
        <div className="mobile-header-brand" onClick={() => navigate('/')} style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="Jamalpur's" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <div className="mobile-header-titles">
            <span className="mobile-app-title" style={{ textDecoration: 'none' }}>Jamalpur's Market</span>
            <span className="mobile-app-badge">Admin Panel</span>
          </div>
        </div>

        <div className="mobile-header-right">
          <button className="btn-mobile-action-pill" onClick={loadAdminData} title="Refresh data">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-mobile-icon-btn" onClick={() => navigate('/admin/notifications')}>
            <Bell size={16} />
            {notifications.length > 0 && <span className="dot-badge" />}
          </button>
          <button className="btn-mobile-icon-btn" onClick={onLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="freshcart-admin-sidebar desktop-only">
        <div className="admin-sidebar-header" onClick={() => navigate('/')} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="admin-brand-icon">
            <img src="/logo.png" alt="Jamalpur's" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div>
            <div className="admin-brand-title" style={{ textDecoration: 'none' }}>Jamalpur's Market</div>
            <div className="admin-brand-sub" style={{ textDecoration: 'none' }}>VEGETABLE STORE ADMIN</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <Link to="/admin" className={tab === 'overview' ? 'admin-nav-link active' : 'admin-nav-link'} style={{ textDecoration: 'none' }}>
            <Grid size={18} /> <span>Dashboard Overview</span>
          </Link>
          <Link to="/admin/products" className={tab === 'vegetables' ? 'admin-nav-link active' : 'admin-nav-link'} style={{ textDecoration: 'none' }}>
            <Box size={18} /> <span>Vegetable Products</span>
          </Link>
          <Link to="/admin/orders" className={tab === 'orders' ? 'admin-nav-link active' : 'admin-nav-link'} style={{ textDecoration: 'none' }}>
            <ShoppingCart size={18} /> <span>Customer Orders</span>
          </Link>
          <Link to="/admin/packages" className={tab === 'packages' ? 'admin-nav-link active' : 'admin-nav-link'} style={{ textDecoration: 'none' }}>
            <Package size={18} /> <span>Special Packages</span>
          </Link>
          <Link to="/admin/branches" className={tab === 'branches' ? 'admin-nav-link active' : 'admin-nav-link'} style={{ textDecoration: 'none' }}>
            <Truck size={18} /> <span>Store Outlets</span>
          </Link>
          <Link to="/admin/customers" className={tab === 'customers' ? 'admin-nav-link active' : 'admin-nav-link'} style={{ textDecoration: 'none' }}>
            <Users size={18} /> <span>Customer Directory</span>
          </Link>
          <Link to="/admin/notifications" className={tab === 'notifications' ? 'admin-nav-link active' : 'admin-nav-link'} style={{ textDecoration: 'none' }}>
            <Bell size={18} /> <span>Notifications ({notifications.length})</span>
          </Link>
          <Link to="/admin/settings" className={tab === 'settings' ? 'admin-nav-link active' : 'admin-nav-link'} style={{ textDecoration: 'none' }}>
            <Settings size={18} /> <span>Store Settings</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="btn-sidebar-store" onClick={() => navigate('/')} style={{ textDecoration: 'none' }}>
            <Eye size={16} /> Visit Customer Store
          </button>
          <button className="btn-sidebar-logout" onClick={onLogout} style={{ textDecoration: 'none' }}>
            <LogOut size={16} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Admin View Container */}
      <div className="freshcart-admin-main">
        {/* Desktop Topbar */}
        <header className="freshcart-admin-topbar desktop-only">
          <div className="topbar-welcome">
            <span className="welcome-badge">ADMIN DASHBOARD</span>
            <span className="welcome-text">Welcome back, <b>{user.name}</b></span>
          </div>

          <div className="topbar-actions">
            <button className="btn-topbar-action" onClick={loadAdminData} title="Refresh live data">
              <RefreshCw size={16} /> Refresh Live Data
            </button>
            <button className="btn-topbar-action" onClick={() => navigate('/')}>
              <Eye size={16} /> Visit Storefront
            </button>
            <button className="btn-topbar-logout" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Body Content */}
        <div className="freshcart-admin-body">
          {tab === 'overview' && (
            <AdminOverviewTab
              stats={stats}
              orders={orders}
              vegs={vegs}
              customers={customers}
              onViewOrderDetails={onViewOrderDetails}
              onViewInvoice={onViewInvoice}
              onViewLabel={onViewLabel}
            />
          )}

          {tab === 'vegetables' && (
            <AdminVegetablesTab
              vegs={vegs}
              categories={[]}
              refreshAdminData={loadAdminData}
            />
          )}

          {tab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              refreshAdminData={loadAdminData}
              onViewOrderDetails={onViewOrderDetails}
              onViewInvoice={onViewInvoice}
              onViewLabel={onViewLabel}
            />
          )}

          {tab === 'packages' && (
            <AdminPackagesTab
              packages={packages}
              vegs={vegs}
              refreshAdminData={loadAdminData}
            />
          )}

          {tab === 'branches' && (
            <AdminBranchesTab
              branches={branches}
              refreshAdminData={loadAdminData}
            />
          )}

          {tab === 'customers' && (
            <AdminCustomersTab
              customers={customers}
              orders={orders}
              onViewOrderDetails={onViewOrderDetails}
              onViewInvoice={onViewInvoice}
              onViewLabel={onViewLabel}
            />
          )}

          {tab === 'settings' && (
            <AdminSettingsTab
              settings={settings}
              refreshAdminData={loadAdminData}
            />
          )}

          {tab === 'notifications' && (
            <AdminNotificationsTab
              notifications={notifications}
            />
          )}
        </div>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="freshcart-admin-mobile-bottom-nav mobile-only">
        <button className={tab === 'overview' ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate('/admin')} style={{ textDecoration: 'none' }}>
          <Grid size={18} /> <span>Dashboard</span>
        </button>
        <button className={tab === 'vegetables' ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate('/admin/products')} style={{ textDecoration: 'none' }}>
          <Box size={18} /> <span>Products</span>
        </button>
        <button className={tab === 'orders' ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate('/admin/orders')} style={{ textDecoration: 'none' }}>
          <ShoppingCart size={18} /> <span>Orders</span>
        </button>
        <button className={tab === 'packages' ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate('/admin/packages')} style={{ textDecoration: 'none' }}>
          <Package size={18} /> <span>Packages</span>
        </button>
        <button
          className={['branches', 'customers', 'notifications', 'settings'].includes(tab) ? 'admin-bottom-item active' : 'admin-bottom-item'}
          onClick={() => setShowMoreModal(true)}
          style={{ textDecoration: 'none' }}
        >
          <Sliders size={18} /> <span>More</span>
        </button>
      </nav>

      {/* Mobile "More" Options Slide-up Sheet */}
      {showMoreModal && (
        <div className="modal-overlay" onClick={() => setShowMoreModal(false)}>
          <div className="modal-card more-options-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Admin Extra Tools</h3>
              <button className="btn-icon" onClick={() => setShowMoreModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="sheet-options-grid">
              <button onClick={() => { setShowMoreModal(false); navigate('/admin/branches'); }} style={{ textDecoration: 'none' }}>
                <Truck size={20} /> <span>Store Outlets</span>
              </button>
              <button onClick={() => { setShowMoreModal(false); navigate('/admin/customers'); }} style={{ textDecoration: 'none' }}>
                <Users size={20} /> <span>Customer Directory</span>
              </button>
              <button onClick={() => { setShowMoreModal(false); navigate('/admin/notifications'); }} style={{ textDecoration: 'none' }}>
                <Bell size={20} /> <span>Notifications ({notifications.length})</span>
              </button>
              <button onClick={() => { setShowMoreModal(false); navigate('/admin/settings'); }} style={{ textDecoration: 'none' }}>
                <Settings size={20} /> <span>Store Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
