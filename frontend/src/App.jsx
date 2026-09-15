import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { api } from './api/apiClient';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import NoticeToast from './components/common/NoticeToast';
import MobileNav from './components/common/MobileNav';
import TaxInvoiceModal from './components/modals/TaxInvoiceModal';
import ParcelLabelModal from './components/modals/ParcelLabelModal';
import OrderSuccessModal from './components/modals/OrderSuccessModal';
import PackageDetailsPage from './pages/PackageDetailsPage';

import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import UserProfilePage from './pages/UserProfilePage';
import UserOrdersPage from './pages/UserOrdersPage';
import UserOrderDetailPage from './pages/UserOrderDetailPage';
import UserAddressesPage from './pages/UserAddressesPage';
import UserSettingsPage from './pages/UserSettingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [veg, setVeg] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [settings, setSettings] = useState({});
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [activeLabel, setActiveLabel] = useState(null);
  const [orderSuccessId, setOrderSuccessId] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadData = () => {
    Promise.all([api('/vegetables'), api('/categories'), api('/packages'), api('/branches'), api('/settings')])
      .then(([v, c, p, b, s]) => {
        setVeg(v);
        setCategories(c);
        setPackages(p);
        setBranches(b);
        setSettings(s);
      })
      .catch(err => console.error('Data load error:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addVeg = (v, quantity = 1) => {
    if (v.availability !== 'Available' || v.stock <= 0) {
      showNotice(`${v.name} is currently out of stock`, 'error');
      return;
    }
    setCart(c => {
      const existing = c.find(x => x.type === 'vegetable' && x.id === v.id);
      if (existing) {
        const newQty = existing.qty + quantity;
        if (newQty > v.stock) {
          showNotice(`Only ${v.stock} ${v.unit} available in stock`, 'error');
          return c;
        }
        return c.map(x => x.id === v.id ? { ...x, qty: newQty } : x);
      }
      return [...c, {
        type: 'vegetable',
        id: v.id,
        name: v.name,
        price: v.price,
        unit: v.unit,
        image: v.image,
        qty: quantity
      }];
    });
    showNotice(`Added ${v.name} (${quantity} ${v.unit}) to cart!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showNotice('Logged out of account session');
    navigate('/');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-root flex flex-col min-h-screen">
      <NoticeToast notice={notice} />

      {!isAdminRoute && (
        <Header
          cartCount={cart.reduce((sum, i) => sum + i.qty, 0)}
          user={user}
          search={search}
          setSearch={setSearch}
          onLogout={handleLogout}
          settings={settings}
        />
      )}

      <main className="flex-1" style={{ paddingBottom: isAdminRoute ? 0 : '70px' }}>
        <Routes>
          <Route path="/" element={
            <HomePage
              veg={veg}
              categories={categories}
              packages={packages}
              cart={cart}
              setCart={setCart}
              search={search}
              cat={cat}
              setCat={setCat}
              addVeg={addVeg}
              onSelectPackage={setSelectedPackage}
            />
          } />

          <Route path="/cart" element={
            <CartPage cart={cart} setCart={setCart} user={user} />
          } />

          <Route path="/checkout" element={
            <CheckoutPage
              cart={cart}
              setCart={setCart}
              user={user}
              onOrderPlaced={orderId => setOrderSuccessId(orderId)}
            />
          } />

          <Route path="/login" element={
            <AuthPage user={user} onLoginSuccess={u => setUser(u)} />
          } />

          <Route path="/register" element={
            <AuthPage user={user} onLoginSuccess={u => setUser(u)} />
          } />

          <Route path="/profile" element={
            <UserProfilePage user={user} onLogout={handleLogout} />
          } />

          <Route path="/user" element={
            <UserProfilePage user={user} onLogout={handleLogout} />
          } />

          <Route path="/orders" element={
            <UserOrdersPage user={user} onViewInvoice={o => setActiveInvoice(o)} />
          } />

          <Route path="/orders/:id" element={
            <UserOrderDetailPage user={user} onViewInvoice={o => setActiveInvoice(o)} />
          } />

          <Route path="/addresses" element={
            <UserAddressesPage user={user} />
          } />

          <Route path="/settings" element={
            <UserSettingsPage user={user} onUpdated={u => setUser(u)} onLogout={handleLogout} />
          } />

          <Route path="/admin/*" element={
            <AdminDashboardPage
              user={user}
              refreshMainData={loadData}
              onViewInvoice={o => setActiveInvoice(o)}
              onViewLabel={o => setActiveLabel(o)}
              onLogout={handleLogout}
              onViewOrderDetails={o => navigate(`/orders/${o.id}`)}
            />
          } />
        </Routes>
      </main>

      {!isAdminRoute && (
        <>
          <Footer settings={settings} />
          <MobileNav cartCount={cart.reduce((sum, i) => sum + i.qty, 0)} user={user} />
        </>
      )}

      {/* Global Modals */}
      {selectedPackage && (
        <PackageDetailsPage
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onAddToCart={item => {
            setCart(c => [...c, item]);
            showNotice(`Added ${item.name} custom combo to cart!`);
          }}
        />
      )}

      {activeInvoice && (
        <TaxInvoiceModal
          order={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}

      {activeLabel && (
        <ParcelLabelModal
          order={activeLabel}
          onClose={() => setActiveLabel(null)}
        />
      )}

      {orderSuccessId && (
        <OrderSuccessModal
          orderId={orderSuccessId}
          onClose={() => setOrderSuccessId(null)}
        />
      )}
    </div>
  );
}
