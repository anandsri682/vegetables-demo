import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid, ShoppingCart, Package, MapPin, User } from 'lucide-react';

export default function MobileNav({ cartCount, user }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide mobile storefront bottom nav on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  const activePath = location.pathname;

  return (
    <nav className="freshcart-admin-mobile-bottom-nav mobile-only" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', zIndex: 9999 }}>
      <button className={activePath === '/' ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate('/')}>
        <Home size={18} /> <span>Home</span>
      </button>

      <button className={activePath === '/orders' || activePath.startsWith('/orders/') ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate(user ? '/orders' : '/login?redirect=/orders')}>
        <Package size={18} /> <span>Orders</span>
      </button>

      <button className={activePath === '/cart' ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate('/cart')} style={{ position: 'relative' }}>
        <ShoppingCart size={18} /> <span>Cart</span>
        {cartCount > 0 && <span className="cart-badge" style={{ position: 'absolute', top: '4px', right: '12px', fontSize: '0.65rem' }}>{cartCount}</span>}
      </button>

      <button className={activePath === '/addresses' ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate(user ? '/addresses' : '/login?redirect=/addresses')}>
        <MapPin size={18} /> <span>Address</span>
      </button>

      <button className={activePath === '/profile' || activePath === '/user' || activePath === '/settings' ? 'admin-bottom-item active' : 'admin-bottom-item'} onClick={() => navigate(user ? '/profile' : '/login')}>
        <User size={18} /> <span>Profile</span>
      </button>
    </nav>
  );
}
