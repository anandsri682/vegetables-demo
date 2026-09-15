import React, { useState } from 'react';
import { Eye, FileText, Printer, CheckCircle } from 'lucide-react';
import { money, api, FALLBACK_VEG_IMG } from '../../api/apiClient';
import PaginationBar from '../../components/common/PaginationBar';

export default function AdminOrdersTab({ orders, refreshAdminData, onViewOrderDetails, onViewInvoice, onViewLabel }) {
  const [ordersPage, setOrdersPage] = useState(1);
  const [statusToast, setStatusToast] = useState(null);

  const updateOrderStatus = async (orderId, newStatus, note) => {
    try {
      await api(`/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, note })
      });
      setStatusToast(`Order #${orderId} status has updated to ${newStatus.toLowerCase()}`);
      setTimeout(() => setStatusToast(null), 4000);
      refreshAdminData();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="admin-section">
      {statusToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 999999,
          background: '#059669',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle size={18} />
          <span>{statusToast}</span>
        </div>
      )}

      <h2>Orders Management & Dispatch</h2>
      <p className="muted">Track customer orders, update delivery fulfillment status, print tax invoices & shipping parcel labels.</p>

      <div className="table-responsive margin-top">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer Details</th>
              <th>Delivery Address</th>
              <th>Items Purchased</th>
              <th>Total</th>
              <th>Status Update</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice((ordersPage - 1) * 10, ordersPage * 10).map(o => (
              <tr key={o.id}>
                <td>
                  <button className="btn-link" style={{ fontWeight: 800, color: '#059669', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => onViewOrderDetails(o)}>
                    #{o.id}
                  </button>
                </td>
                <td>
                  <b>{o.customer_name}</b><br />
                  <small className="muted">{o.phone}</small><br />
                  <small className="muted">{o.email}</small>
                </td>
                <td>
                  {o.address}<br />
                  <small><b>{o.city} - {o.pin}</b></small>
                </td>
                <td>
                  <div className="order-items-mini-list">
                    {o.items.map(it => (
                      <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                        <img src={it.image || FALLBACK_VEG_IMG} alt={it.name_snapshot} style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }} onError={e => e.target.src = FALLBACK_VEG_IMG} />
                        <small>• {it.name_snapshot} ({it.quantity} {it.unit_snapshot})</small>
                      </div>
                    ))}
                  </div>
                </td>
                <td><b>{money(o.total)}</b><br /><small className="muted">{o.payment_method}</small></td>
                <td>
                  <select
                    value={o.status}
                    onChange={e => updateOrderStatus(o.id, e.target.value)}
                    className="status-select-input"
                  >
                    <option value="New">New</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <div className="action-btns-flex">
                    <button className="btn-icon" onClick={() => onViewOrderDetails(o)} title="View Order Details"><Eye size={14} /></button>
                    <button className="btn-icon" onClick={() => onViewInvoice(o)} title="Tax Invoice"><FileText size={14} /></button>
                    <button className="btn-icon" onClick={() => onViewLabel(o)} title="Shipping Label"><Printer size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationBar currentPage={ordersPage} totalItems={orders.length} pageSize={10} onPageChange={setOrdersPage} />
      </div>
    </div>
  );
}
