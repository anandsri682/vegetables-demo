import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Filter, Clock } from 'lucide-react';
import { api, money, getImageUrl, FALLBACK_VEG_IMG } from '../api/apiClient';

export default function UserOrdersPage({ user, onViewInvoice }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('12weeks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders');
      return;
    }
    api('/orders')
      .then(data => setOrders(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filteredOrders = orders.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    if (orderFilter === '30days') return (now - d) <= 30 * 24 * 60 * 60 * 1000;
    if (orderFilter === '12weeks') return (now - d) <= 12 * 7 * 24 * 60 * 60 * 1000;
    if (orderFilter === '6months') return (now - d) <= 180 * 24 * 60 * 60 * 1000;
    if (orderFilter === '1year') return (now - d) <= 365 * 24 * 60 * 60 * 1000;
    return true;
  });

  return (
    <div className="ref-orders-container page-container margin-top">
      <div className="ref-orders-header">
        <h2 className="ref-orders-title">Your Orders</h2>
        <div className="ref-orders-filter">
          <Filter size={16} />
          <span>Filter :</span>
          <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}>
            <option value="12weeks">Past 12 Weeks</option>
            <option value="30days">Past 30 Days</option>
            <option value="6months">Past 6 Months</option>
            <option value="1year">Past 1 Year</option>
            <option value="all">All Orders ({orders.length})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card-box padding" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="muted">Loading your order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-box card-box" style={{ padding: '50px 20px', textAlign: 'center' }}>
          <Package size={48} className="muted" />
          <h3>No Orders Placed Yet</h3>
          <p className="muted">Your order history will appear here once you place an order.</p>
          <Link to="/" className="btn-primary margin-top">Start Shopping</Link>
        </div>
      ) : (
        <div className="ref-orders-list">
          {filteredOrders.map(o => (
            <div key={o.id} className="ref-order-card">
              <div className="ref-order-topbar">
                <div className="ref-meta-group">
                  <div className="ref-meta-item">
                    <span className="ref-meta-label">Order Number :</span>
                    <span className="ref-meta-val">#{o.id}</span>
                  </div>
                  <div className="ref-meta-item">
                    <span className="ref-meta-label">Order Date :</span>
                    <span className="ref-meta-val">
                      {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="ref-meta-item">
                    <span className="ref-meta-label">Total Amount :</span>
                    <span className="ref-meta-val">{money(o.total)}</span>
                  </div>
                  <div className="ref-meta-item">
                    <span className="ref-meta-label">Status :</span>
                    <span className={`ref-meta-val status-${o.status.toLowerCase().replace(/\s+/g, '-')}`}>{o.status}</span>
                  </div>
                </div>

                <div className="ref-order-top-actions">
                  <button className="btn-ref-outline" onClick={() => onViewInvoice(o)}>View Invoice</button>
                  <button className="btn-ref-primary" onClick={() => navigate(`/orders/${o.id}`)}>View Order</button>
                </div>
              </div>

              {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                <div className="ref-delivery-banner">
                  <Clock size={16} /> Estimated Delivery: Within 2 Hours (Dispatched from local store branch)
                </div>
              )}

              <div className="ref-items-list">
                {o.items.map(item => (
                  <div key={item.id} className="ref-item-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div className="ref-item-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name_snapshot}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0, border: '1px solid #cbd5e1' }}
                        onError={e => e.target.src = FALLBACK_VEG_IMG}
                      />
                      <div className="ref-item-details">
                        <div className="ref-item-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.name_snapshot}</div>
                        <div className="ref-item-desc" style={{ fontSize: '0.82rem', color: '#64748b' }}>Fresh 100% organic farm produce delivered directly to kitchen.</div>
                        <div className="ref-item-specs" style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>
                          Quantity : <b>{item.quantity} {item.unit_snapshot}</b> • Price : <b>{money(item.price)}</b>
                        </div>
                        {item.customized_items && item.customized_items.length > 0 && (
                          <div className="ref-item-specs" style={{ color: '#059669', marginTop: '4px', fontSize: '0.8rem' }}>
                            Choices: {item.customized_items.map(c => `${c.name_snapshot} (${c.quantity_snapshot || '1 kg'})`).join(', ')}
                          </div>
                        )}
                        <div className="ref-item-actions" style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.8rem' }}>
                          <button onClick={() => navigate(`/orders/${o.id}`)} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 600, padding: 0 }}>View Details</button>
                          <span>|</span>
                          <button onClick={() => navigate(`/orders/${o.id}`)} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Buy Again</button>
                        </div>
                      </div>
                    </div>
                    <div className="ref-item-price" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{money(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
