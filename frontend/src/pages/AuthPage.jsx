import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../api/apiClient';

export default function AuthPage({ user, onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterRoute = location.pathname === '/register';

  const [mode, setMode] = useState(isRegisterRoute ? 'register' : 'login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    city: 'Hyderabad',
    pin: ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(isRegisterRoute ? 'register' : 'login');
  }, [isRegisterRoute]);

  const fillAdminCredentials = () => {
    setForm(prev => ({
      ...prev,
      email: 'admin@jamalpurs.local',
      password: 'Admin@123'
    }));
    setMode('login');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(form)
      });

      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      onLoginSuccess(res.user);

      // Check if redirect query param exists
      const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get('redirect') || (res.user.role === 'admin' ? '/admin' : '/profile');
      navigate(redirectPath);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container narrow margin-top" style={{ maxWidth: '440px', margin: '40px auto' }}>
      <div className="card-box" style={{ padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo.png" alt="RRV Trades Logo" style={{ width: 44, height: 44, margin: '0 auto 8px auto' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '4px 0' }}>
            {mode === 'login' ? 'Sign In to RRV Trades' : 'Create Account'}
          </h2>

          <p className="muted" style={{ fontSize: '0.85rem' }}>
            {mode === 'login' ? 'Access your orders, saved addresses & tax invoices' : 'Register for express 2-hr vegetable delivery'}
          </p>
        </div>

        {err && (
          <div className="alert-box-card danger margin-bottom" style={{ padding: '10px', fontSize: '0.85rem' }}>
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          {mode === 'register' && (
            <label className="full-width">
              Full Name *
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </label>
          )}

          <label className="full-width">
            Email Address *
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
          </label>

          <label className="full-width">
            Password *
            <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </label>

          {mode === 'register' && (
            <>
              <label className="full-width">
                Phone Number *
                <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
              </label>

              <label className="full-width">
                Primary Delivery Address *
                <textarea rows={2} required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street, Door No, Landmark..." />
              </label>

              <label>
                City *
                <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </label>

              <label>
                Pincode *
                <input required value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} placeholder="500001" />
              </label>
            </>
          )}

          <button type="submit" className="btn-primary full-width margin-top" disabled={loading} style={{ padding: '12px', fontSize: '1rem' }}>
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-quick-demo margin-top" style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Demo Store Administrator Access:</span>
          <button type="button" className="btn-outline-sm" onClick={fillAdminCredentials}>
            Fill Admin Credentials (admin@jamalpurs.local)
          </button>
        </div>

        <div className="auth-toggle margin-top" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          {mode === 'login' ? (
            <span>Don't have an account? <Link to="/register" style={{ color: '#059669', fontWeight: 700 }}>Register here</Link></span>
          ) : (
            <span>Already registered? <Link to="/login" style={{ color: '#059669', fontWeight: 700 }}>Sign In</Link></span>
          )}
        </div>
      </div>
    </div>
  );
}
