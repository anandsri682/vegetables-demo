import React from 'react';
import { Printer, XCircle } from 'lucide-react';

export default function ParcelLabelModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card print-label-modal" style={{ maxWidth: '500px', padding: '24px' }}>
        <div className="flex-between align-center print-hide" style={{ marginBottom: '16px' }}>
          <h3>Shipping Parcel Label</h3>
          <div className="flex gap-2">
            <button className="btn-primary-sm" onClick={() => window.print()}>
              <Printer size={16} /> Print Label
            </button>
            <button className="btn-icon" onClick={onClose}><XCircle size={20} /></button>
          </div>
        </div>

        <div className="printable-parcel-label" style={{ border: '2px dashed #059669', borderRadius: '12px', padding: '20px', background: '#fff' }}>
          <div className="flex-between align-center" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
            <div>
              <strong style={{ fontSize: '1.1rem', color: '#059669' }}>RRV Trades Market</strong><br />

              <small className="muted">Express Vegetable Delivery</small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge-admin" style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.9rem' }}>ORDER #{order.id}</span>
            </div>
          </div>

          <div className="margin-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <small className="muted">DELIVER TO:</small>
              <h3 style={{ margin: '4px 0', fontSize: '1.2rem', color: '#0f172a' }}>{order.customer_name}</h3>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {order.address}<br />
                <b>{order.city} - {order.pin}</b>
              </p>
              <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                <b>PHONE:</b> {order.phone}
              </p>
              {order.instructions && (
                <div style={{ marginTop: '8px', padding: '6px 10px', background: '#fffbebe6', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <b>Delivery Note:</b> {order.instructions}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/orders/${order.id}`)}`}
                alt="Track Order Delivery Status QR Code"
                style={{ width: 90, height: 90, display: 'block', margin: '0 auto' }}
              />
              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, display: 'block', marginTop: '4px', maxWidth: '95px', lineHeight: '1.1' }}>
                Scan to Track Status
              </span>
            </div>
          </div>

          <div className="flex-between margin-top" style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px', fontSize: '0.8rem' }}>
            <div>Items: <b>{order.items.reduce((s, i) => s + i.quantity, 0)} Units</b></div>
            <div>Payment: <b>{order.payment_method} ({order.payment_status})</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}
