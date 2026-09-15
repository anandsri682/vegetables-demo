import React from 'react';
import { FileText, Printer, XCircle, Leaf } from 'lucide-react';
import { money } from '../../api/apiClient';

export default function TaxInvoiceModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card print-invoice-modal" style={{ maxWidth: '750px', padding: '30px' }}>
        <div className="flex-between align-center print-hide" style={{ marginBottom: '20px' }}>
          <h2>Tax Invoice</h2>
          <div className="flex gap-2">
            <button className="btn-primary-sm" onClick={() => window.print()}>
              <Printer size={16} /> Print / Download PDF
            </button>
            <button className="btn-icon" onClick={onClose}><XCircle size={22} /></button>
          </div>
        </div>

        <div className="printable-invoice-content" id="printable-invoice">
          <div className="invoice-header-row flex-between align-center" style={{ borderBottom: '2px solid #059669', paddingBottom: '16px' }}>
            <div className="flex align-center gap-2">
              <img src="/logo.png" alt="Jamalpur's" style={{ width: 40, height: 40 }} />
              <div>
                <h2 style={{ margin: 0, color: '#059669', fontSize: '1.4rem' }}>Jamalpur's Market</h2>
                <small className="muted">100% Farm Fresh Vegetables & Budget Packages</small>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>TAX INVOICE</h3>
              <small>Invoice #: <b>INV-{order.id}</b></small><br />
              <small>Date: <b>{new Date(order.created_at).toLocaleDateString()}</b></small>
            </div>
          </div>

          <div className="grid-2-cols margin-top" style={{ fontSize: '0.85rem', alignItems: 'center' }}>
            <div>
              <strong>Billed To (Customer):</strong>
              <p style={{ margin: '4px 0' }}>
                <b>{order.customer_name}</b><br />
                {order.address}<br />
                {order.city} - {order.pin}<br />
                Phone: {order.phone}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <strong>Seller Outlet:</strong>
                <p style={{ margin: '4px 0' }}>
                  <b>Jamalpur's Central Warehouse</b><br />
                  GSTIN: 36AAACJ9988K1Z5<br />
                  Support: +91 98765 43210
                </p>
              </div>
              <div style={{ textAlign: 'center', background: '#f8fafc', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`${window.location.origin}/orders/${order.id}`)}`}
                  alt="Track Order Delivery Status QR Code"
                  style={{ width: 80, height: 80, display: 'block', margin: '0 auto' }}
                />
                <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, display: 'block', marginTop: '4px', maxWidth: '85px', lineHeight: '1.1' }}>
                  Scan to Track Status
                </span>
              </div>
            </div>
          </div>

          <table className="admin-table margin-top" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th>#</th>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={it.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <b>{it.name_snapshot}</b>
                    {it.customized_items && it.customized_items.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                        Choices: {it.customized_items.map(c => `${c.name_snapshot} (${c.quantity_snapshot || '1 kg'})`).join(', ')}
                      </div>
                    )}
                  </td>
                  <td>{it.quantity} {it.unit_snapshot}</td>
                  <td>{money(it.price)}</td>
                  <td style={{ textAlign: 'right' }}>{money(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex-between margin-top" style={{ fontSize: '0.85rem', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <div>
              <small className="muted">Payment Method: <b>{order.payment_method}</b></small><br />
              <small className="muted">Status: <b>{order.payment_status}</b></small>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>Subtotal: <b>{money(order.subtotal)}</b></div>
              <div>Delivery Charge: <b>{money(order.delivery_charge)}</b></div>
              <div>Discount: <b>-{money(order.discount)}</b></div>
              <h3 style={{ margin: '6px 0 0 0', color: '#059669' }}>Grand Total: {money(order.total)}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
