import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Eye, FileText, Printer, Search, Phone, Mail, MapPin } from 'lucide-react';
import PaginationBar from '../../components/common/PaginationBar';
import { money, getImageUrl, FALLBACK_VEG_IMG } from '../../api/apiClient';

export default function AdminCustomersTab({ customers = [], orders = [], onViewOrderDetails, onViewInvoice, onViewLabel }) {
  const [selectedCust, setSelectedCust] = useState(null);
  const [custPage, setCustPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter customers by search term
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper to match customer orders by customer_id or phone/email/name
  const getCustomerOrders = (cust) => {
    return orders.filter(o => 
      o.customer_id === cust.id ||
      (o.phone && cust.phone && o.phone === cust.phone) ||
      (o.email && cust.email && o.email.toLowerCase() === cust.email.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase() === cust.name.toLowerCase())
    );
  };

  // If a customer is selected, render their complete Order History view
  if (selectedCust) {
    const custOrders = getCustomerOrders(selectedCust);
    const totalSpent = custOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return (
      <div className="admin-section">
        <div className="flex-between align-center margin-bottom">
          <button 
            className="btn-outline-sm flex align-center gap-1"
            onClick={() => setSelectedCust(null)}
            style={{ padding: '8px 16px', borderRadius: '20px', background: '#ffffff', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Back to Customer Directory
          </button>
          <span className="badge-admin" style={{ background: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '20px', fontWeight: 700 }}>
            Customer Profile #{selectedCust.id}
          </span>
        </div>

        {/* Customer Info Card */}
        <div className="card-box margin-top" style={{ padding: '24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div className="flex-between align-center" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem' }}>{selectedCust.name}</h2>
              <div className="flex gap-4 margin-top" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                <span className="flex align-center gap-1"><Mail size={14} /> {selectedCust.email || 'N/A'}</span>
                <span className="flex align-center gap-1"><Phone size={14} /> {selectedCust.phone || 'N/A'}</span>
                <span className="flex align-center gap-1"><MapPin size={14} /> {selectedCust.city || selectedCust.address || 'N/A'}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Placed Orders</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>{custOrders.length} Orders</div>
              <small className="muted">Total Spent: <b>{money(totalSpent)}</b></small>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
            <strong>Default Address:</strong> {selectedCust.address || 'No address saved'}, {selectedCust.city || ''} {selectedCust.pin ? `- ${selectedCust.pin}` : ''}
          </p>
        </div>

        {/* Customer Placed Orders List */}
        <div className="margin-top">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#0f172a' }}>
            Orders Placed by {selectedCust.name} ({custOrders.length})
          </h3>

          {custOrders.length === 0 ? (
            <div className="empty-box card-box" style={{ padding: '40px', textAlign: 'center' }}>
              <ShoppingBag size={48} className="muted" />
              <h4>No Orders Placed Yet</h4>
              <p className="muted">This customer has not completed any orders so far.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {custOrders.map(o => (
                <div key={o.id} className="ref-order-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  {/* Top Meta Bar */}
                  <div className="ref-order-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                    <div className="ref-meta-group" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <small className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>ORDER ID</small>
                        <strong style={{ color: '#0f172a', fontSize: '1rem' }}>#{o.id}</strong>
                      </div>
                      <div>
                        <small className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>DATE</small>
                        <strong>{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                      </div>
                      <div>
                        <small className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>TOTAL AMOUNT</small>
                        <strong style={{ color: '#059669', fontSize: '1rem' }}>{money(o.total)}</strong>
                      </div>
                      <div>
                        <small className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>STATUS</small>
                        <span className={`ref-meta-val status-${(o.status || 'New').toLowerCase().replace(/\s+/g, '-')}`} style={{ fontWeight: 800 }}>
                          {o.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        className="btn-primary-sm"
                        onClick={() => onViewOrderDetails && onViewOrderDetails(o.id)}
                        style={{ background: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={14} /> View Order
                      </button>
                      <button 
                        className="btn-outline-sm"
                        onClick={() => onViewInvoice && onViewInvoice(o)}
                        style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={14} /> Invoice
                      </button>
                      <button 
                        className="btn-outline-sm"
                        onClick={() => onViewLabel && onViewLabel(o)}
                        style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Printer size={14} /> Label
                      </button>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="order-items-compact" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(o.items || []).map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name_snapshot} 
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                          onError={e => e.target.src = FALLBACK_VEG_IMG}
                        />
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{item.name_snapshot}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Qty: {item.quantity} {item.unit_snapshot} • Price: {money(item.price)}
                          </div>
                          {item.customized_items && item.customized_items.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '2px' }}>
                              Choices: {item.customized_items.map(c => `${c.name_snapshot} (${c.quantity_snapshot || '1 kg'})`).join(', ')}
                            </div>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                          {money(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default Customer Directory View
  const paginatedCustomers = filteredCustomers.slice((custPage - 1) * 10, custPage * 10);

  return (
    <div className="admin-section">
      <div className="flex-between align-center margin-bottom" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Customer Directory ({customers.length})</h2>
          <p className="muted">Click on any customer to inspect all their placed orders and purchase history.</p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div className="table-responsive margin-top">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City / Location</th>
              <th>Orders Placed</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No customer profiles found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              paginatedCustomers.map(c => {
                const cOrders = getCustomerOrders(c);
                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedCust(c)}>
                    <td>#{c.id}</td>
                    <td><b style={{ color: '#0f172a' }}>{c.name}</b></td>
                    <td>{c.email || 'N/A'}</td>
                    <td>{c.phone || 'N/A'}</td>
                    <td>{c.city || 'N/A'}</td>
                    <td>
                      <span className="badge-admin" style={{ background: cOrders.length > 0 ? '#ecfdf5' : '#f1f5f9', color: cOrders.length > 0 ? '#059669' : '#64748b', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem' }}>
                        {cOrders.length} Orders
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-primary-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCust(c);
                        }}
                        style={{
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
                        }}
                      >
                        <Eye size={14} /> View Orders ({cOrders.length})
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {filteredCustomers.length > 10 && (
          <PaginationBar 
            currentPage={custPage} 
            totalItems={filteredCustomers.length} 
            pageSize={10} 
            onPageChange={setCustPage} 
          />
        )}
      </div>
    </div>
  );
}
