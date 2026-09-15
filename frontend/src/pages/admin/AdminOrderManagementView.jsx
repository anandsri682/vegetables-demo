import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, FileText, Printer, Clock, MapPin, Package, ShieldCheck } from 'lucide-react';
import { api, money, getImageUrl, FALLBACK_VEG_IMG } from '../../api/apiClient';

export default function AdminOrderManagementView({ order, onClose, refreshAdminData, onViewInvoice, onViewLabel }) {
  const [status, setStatus] = useState(order?.status || 'New');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  if (!order) return null;

  const handleUpdateStatus = async e => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await api(`/admin/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: note || `Status updated to ${status} by admin` })
      });
      setToastMsg(`Order #${order.id} status updated to ${status}`);
      setNote('');
      setTimeout(() => setToastMsg(null), 3000);
      if (refreshAdminData) refreshAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const STAGES = ['New', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStageIndex = STAGES.indexOf(order.status);

  return (
    <div className="admin-order-management-view card-box" style={{ padding: '24px', margin: '10px 0' }}>
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          background: '#059669',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700
        }}>
          <CheckCircle size={18} /> {toastMsg}
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex-between align-center margin-bottom" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="btn-outline-sm" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </button>

        <div className="flex align-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span className={`status-badge-lg status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
            {order.status}
          </span>
          <button className="btn-primary-sm" onClick={() => onViewInvoice(order)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} /> Tax Invoice
          </button>
          <button className="btn-secondary-sm" onClick={() => onViewLabel(order)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={14} /> Shipping Label
          </button>
        </div>
      </div>

      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
        <div className="flex align-center gap-2">
          <ShieldCheck size={22} style={{ color: '#059669' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>Admin Order Management #{order.id}</h2>
        </div>
        <p className="muted" style={{ fontSize: '0.88rem', margin: '4px 0 0 0' }}>
          Order placed on {new Date(order.createdAt || order.created_at || Date.now()).toLocaleString()}
        </p>
      </div>

      {/* Admin Quick Order Status & Tracking Update Form */}
      <div className="card-box" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '18px', borderRadius: '12px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#065f46', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} /> Update Order Fulfillment & Delivery Status:
        </h4>

        <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', display: 'block', marginBottom: '4px' }}>Fulfillment Stage:</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="status-select-input"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #6ee7b7', fontWeight: 700 }}
              >
                <option value="New">New</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ flex: 2, minWidth: '240px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', display: 'block', marginBottom: '4px' }}>Log Activity Note (Optional):</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Dispatched with delivery agent Suresh (+91 98765 12345)"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #6ee7b7', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: 'fit-content', padding: '10px 20px', fontSize: '0.9rem' }}
          >
            {loading ? 'Saving Update...' : 'Save & Publish Tracking Update'}
          </button>
        </form>
      </div>

      {/* Grid: Customer Details & Payment Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} /> Customer & Delivery Details
          </div>
          <div style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
            <strong>{order.customer_name}</strong><br />
            {order.address}<br />
            <b>{order.city} - {order.pin}</b><br />
            <small className="muted">Phone: <b>{order.phone}</b></small><br />
            <small className="muted">Email: <b>{order.email || 'N/A'}</b></small>
            {order.instructions && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#059669', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px' }}>
                <b>Instructions:</b> {order.instructions}
              </div>
            )}
          </div>
        </div>

        <div className="card-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} /> Financial & Payment Summary
          </div>
          <div style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
            Subtotal: <b>{money(order.subtotal)}</b><br />
            Delivery Charge: <b>{money(order.delivery_charge)}</b><br />
            Discount: <b>-{money(order.discount)}</b><br />
            Payment Method: <b>{order.payment_method}</b><br />
            Payment Status: <b>{order.payment_status}</b><br />
            <strong style={{ color: '#059669', fontSize: '1.2rem', display: 'block', marginTop: '6px' }}>
              Grand Total: {money(order.total)}
            </strong>
          </div>
        </div>
      </div>

      {/* Admin Order Items List */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '12px' }}>
          Items Purchased ({order.items.reduce((s, i) => s + i.quantity, 0)} units)
        </h3>
        <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table className="admin-table" style={{ fontSize: '0.88rem', width: '100%', minWidth: '500px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th>Item Image</th>
                <th>Item Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(it => (
                <tr key={it.id}>
                  <td style={{ width: '60px' }}>
                    <img
                      src={getImageUrl(it.image)}
                      alt={it.name_snapshot}
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }}
                      onError={e => e.target.src = FALLBACK_VEG_IMG}
                    />
                  </td>
                  <td>
                    <b>{it.name_snapshot}</b>
                    {it.customized_items && it.customized_items.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '2px' }}>
                        Custom Choices: {it.customized_items.map(c => `${c.name_snapshot} (${c.quantity_snapshot || '1 kg'})`).join(', ')}
                      </div>
                    )}
                  </td>
                  <td><b>{it.quantity} {it.unit_snapshot}</b></td>
                  <td>{money(it.price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>{money(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracking Updates Timeline Log */}
      {order.tracking_updates && order.tracking_updates.length > 0 && (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Live Audit & Tracking Activity Log:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {order.tracking_updates.map((tu, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <Clock size={14} style={{ color: '#059669', flexShrink: 0 }} />
                <span><b>{tu.status}:</b> {tu.note}</span>
                <small className="muted" style={{ marginLeft: 'auto' }}>{new Date(tu.time).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
