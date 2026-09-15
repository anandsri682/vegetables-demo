import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingCart, FileText } from 'lucide-react';

export default function OrderSuccessModal({ orderId, onClose }) {
  const navigate = useNavigate();

  if (!orderId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card order-success-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '36px 24px' }}>
        <div className="success-icon-bounce" style={{ width: 72, height: 72, background: '#ecfdf5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <CheckCircle size={44} />
        </div>

        <h2 style={{ fontSize: '1.6rem', color: '#0f172a', margin: '8px 0' }}>Order Placed Successfully!</h2>
        <p className="muted" style={{ fontSize: '0.95rem', margin: '8px 0 20px 0' }}>
          Thank you for shopping with <b>Jamalpur's Market</b>! Your order <b>#{orderId}</b> has been received and sent to our local store outlet for packing.
        </p>

        <div className="success-action-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="btn-secondary"
            onClick={() => {
              onClose();
              navigate('/');
            }}
            style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ShoppingCart size={16} /> Continue Shopping
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              onClose();
              navigate(`/orders/${orderId}`);
            }}
            style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FileText size={16} /> View Order Details
          </button>
        </div>
      </div>
    </div>
  );
}
