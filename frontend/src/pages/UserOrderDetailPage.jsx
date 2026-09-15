import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Check, Clock, MapPin, Package } from 'lucide-react';
import { api, money, getImageUrl, FALLBACK_VEG_IMG } from '../api/apiClient';

export default function UserOrderDetailPage({ user, onViewInvoice }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders/' + id);
      return;
    }
    api(`/orders/${id}`)
      .then(data => setOrder(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) {
    return (
      <div className="page-container narrow margin-top" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p className="muted">Loading order details #{id}...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container narrow margin-top" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Package size={48} className="muted" />
        <h3>Order #{id} Not Found</h3>
        <button className="btn-primary margin-top" onClick={() => navigate('/orders')}>Back to Your Orders</button>
      </div>
    );
  }

  const STAGES = ['New', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStageIndex = STAGES.indexOf(order.status);

  return (
    <div className="page-container margin-top">
      <div className="card-box" style={{ padding: '24px' }}>
        <div className="flex-between align-center margin-bottom" style={{ marginBottom: '20px' }}>
          <button className="btn-outline-sm" onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Back to Your Orders
          </button>
          <div className="flex align-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-badge-lg status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
              {order.status}
            </span>
            <button className="btn-primary" onClick={() => onViewInvoice(order)} style={{ padding: '6px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Print Tax Invoice
            </button>
          </div>
        </div>

        <div className="page-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', margin: '4px 0' }}>Order Details #{order.id}</h2>
          <p className="muted" style={{ fontSize: '0.88rem' }}>Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>

        {/* Live Delivery 5-Stage Tracker Bar */}
        {order.status !== 'Cancelled' && (
          <div className="card-box margin-top" style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: '#0f172a' }}>Live Store Fulfillment Stage Tracker:</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', margin: '20px 0' }}>
              {/* Connector Bar Background */}
              <div style={{ position: 'absolute', top: '15px', left: '30px', right: '30px', height: '4px', background: '#e2e8f0', zIndex: 1 }} />
              
              {/* Connector Bar Active Line */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '30px',
                width: `${Math.max(0, Math.min(100, (currentStageIndex / (STAGES.length - 1)) * 100))}%`,
                height: '4px',
                background: '#059669',
                zIndex: 1,
                transition: 'width 0.5s ease'
              }} />

              {STAGES.map((s, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isPassed ? '#059669' : '#ffffff',
                      color: isPassed ? '#ffffff' : '#94a3b8',
                      border: isPassed ? '2px solid #059669' : '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      boxShadow: isCurrent ? '0 0 0 4px #a7f3d0' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {isPassed ? <Check size={16} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: isCurrent ? 800 : isPassed ? 700 : 500, color: isPassed ? '#0f172a' : '#64748b', marginTop: '6px', textAlign: 'center' }}>
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Line-by-Line Tracking Activity History Log */}
        {order.tracking_updates && order.tracking_updates.length > 0 && (
          <div className="tracking-logs margin-top" style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <small style={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Store Activity Log:</small>
            <div className="margin-top flex flex-col gap-2">
              {order.tracking_updates.map((tu, i) => (
                <div key={i} className="log-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Clock size={14} style={{ color: '#059669', flexShrink: 0 }} />
                  <span><b>{tu.status}:</b> {tu.note}</span>
                  <small className="muted" style={{ marginLeft: 'auto' }}>{new Date(tu.time).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address & Payment Grid */}
        <div className="order-detail-meta-grid margin-top" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="meta-box card-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
            <div className="meta-box-title" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> Delivery Address Details
            </div>
            <div className="meta-box-content" style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
              <strong>{order.customer_name}</strong><br />
              {order.address}<br />
              <b>{order.city} - {order.pin}</b><br />
              <small className="muted">Phone: {order.phone}</small>
              {order.instructions && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#059669', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px' }}>
                  <b>Instructions:</b> {order.instructions}
                </div>
              )}
            </div>
          </div>

          <div className="meta-box card-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
            <div className="meta-box-title" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} /> Payment & Price Summary
            </div>
            <div className="meta-box-content" style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
              Subtotal: <b>{money(order.subtotal)}</b><br />
              Delivery Charge: <b>{money(order.delivery_charge)}</b><br />
              Discount: <b>-{money(order.discount)}</b><br />
              Payment Method: <b>{order.payment_method} ({order.payment_status})</b><br />
              <strong style={{ color: '#059669', fontSize: '1.15rem', display: 'block', marginTop: '8px' }}>Grand Total: {money(order.total)}</strong>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="margin-top">
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Ordered Vegetables ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</h3>
          <div className="ref-items-list margin-top" style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
            {order.items.map(item => (
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
                      Quantity : <b>{item.quantity} {item.unit_snapshot}</b> • Unit Price : <b>{money(item.price)}</b>
                    </div>
                    {item.customized_items && item.customized_items.length > 0 && (
                      <div className="ref-item-specs" style={{ color: '#059669', marginTop: '4px', fontSize: '0.8rem' }}>
                        Choices: {item.customized_items.map(c => `${c.name_snapshot} (${c.quantity_snapshot || '1 kg'})`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ref-item-price" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{money(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
