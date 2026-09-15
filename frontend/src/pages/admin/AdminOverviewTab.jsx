import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, Box, Users, Clock, Package, CheckCircle, XCircle, AlertTriangle, AlertCircle, Eye, FileText, Printer } from 'lucide-react';
import { money } from '../../api/apiClient';

export default function AdminOverviewTab({ stats, orders, vegs, customers, onViewOrderDetails, onViewInvoice, onViewLabel }) {
  const navigate = useNavigate();

  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrdersCount = orders.length;
  const totalProductsCount = vegs.length;
  const totalCustomersCount = customers.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'New' || o.status === 'Confirmed').length;
  const processingOrdersCount = orders.filter(o => o.status === 'Preparing' || o.status === 'Out for Delivery').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;

  const outOfStockItems = vegs.filter(v => v.stock <= 0 || v.availability === 'Out of Stock');
  const lowStockItems = vegs.filter(v => v.stock > 0 && v.stock <= 10);

  return (
    <div className="admin-overview-tab">
      <div className="overview-header">
        <h2>RRV Trades Store Overview & Analytics</h2>

        <p>Real-time analytics for vegetables, customer orders, revenue, and inventory status.</p>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap emerald"><DollarSign size={22} /></div>
          <div>
            <span className="kpi-label">TOTAL REVENUE</span>
            <div className="kpi-value">{money(totalRevenue)}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap blue"><ShoppingCart size={22} /></div>
          <div>
            <span className="kpi-label">TOTAL ORDERS</span>
            <div className="kpi-value">{totalOrdersCount}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap amber"><Box size={22} /></div>
          <div>
            <span className="kpi-label">VEGETABLE PRODUCTS</span>
            <div className="kpi-value">{totalProductsCount}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap purple"><Users size={22} /></div>
          <div>
            <span className="kpi-label">TOTAL CUSTOMERS</span>
            <div className="kpi-value">{totalCustomersCount}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap sky"><Clock size={22} /></div>
          <div>
            <span className="kpi-label">PENDING ORDERS</span>
            <div className="kpi-value">{pendingOrdersCount}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap indigo"><Package size={22} /></div>
          <div>
            <span className="kpi-label">PROCESSING ORDERS</span>
            <div className="kpi-value">{processingOrdersCount}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap green"><CheckCircle size={22} /></div>
          <div>
            <span className="kpi-label">DELIVERED ORDERS</span>
            <div className="kpi-value">{deliveredOrdersCount}</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap rose"><XCircle size={22} /></div>
          <div>
            <span className="kpi-label">CANCELLED ORDERS</span>
            <div className="kpi-value">{cancelledOrdersCount}</div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="stock-alerts-row margin-top">
          {outOfStockItems.length > 0 && (
            <div className="alert-box-card danger">
              <AlertTriangle size={20} />
              <div>
                <strong>{outOfStockItems.length} Vegetable(s) Out of Stock!</strong>
                <p>{outOfStockItems.map(x => x.name).join(', ')}</p>
              </div>
              <button className="btn-outline-sm danger" onClick={() => navigate('/admin/products')}>Manage Inventory</button>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="alert-box-card warning">
              <AlertCircle size={20} />
              <div>
                <strong>{lowStockItems.length} Vegetable(s) Low Stock (&le; 10 kg)</strong>
                <p>{lowStockItems.map(x => `${x.name} (${x.stock} ${x.unit})`).join(', ')}</p>
              </div>
              <button className="btn-outline-sm" onClick={() => navigate('/admin/products')}>Restock Items</button>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="card-box margin-top">
        <div className="card-box-header">
          <h3>Recent Customer Orders</h3>
          <button className="btn-link" onClick={() => navigate('/admin/orders')}>View All Orders &rarr;</button>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td>
                    <button className="btn-link" style={{ fontWeight: 800, color: '#059669', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => onViewOrderDetails(o)}>
                      #{o.id}
                    </button>
                  </td>
                  <td>{o.customer_name}<br /><small className="muted">{o.phone}</small></td>
                  <td>{o.city}</td>
                  <td><b>{money(o.total)}</b></td>
                  <td><span className={`status-badge status-${o.status.toLowerCase().replace(/\s+/g, '-')}`}>{o.status}</span></td>
                  <td>
                    <div className="action-btns-flex">
                      <button className="btn-icon" onClick={() => onViewOrderDetails(o)} title="View Order Details"><Eye size={14} /></button>
                      <button className="btn-icon" onClick={() => onViewInvoice(o)} title="Print Tax Invoice"><FileText size={14} /></button>
                      <button className="btn-icon" onClick={() => onViewLabel(o)} title="Print Parcel Label"><Printer size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
