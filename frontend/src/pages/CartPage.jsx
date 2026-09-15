import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { money, getImageUrl, FALLBACK_VEG_IMG } from '../api/apiClient';

export default function CartPage({ cart, setCart, user }) {
  const navigate = useNavigate();

  const updateQty = (index, delta) => {
    setCart(c => {
      const next = [...c];
      const item = next[index];
      const newQty = item.qty + delta;
      if (newQty <= 0) return next.filter((_, i) => i !== index);
      next[index] = { ...item, qty: newQty };
      return next;
    });
  };

  const removeItem = index => {
    setCart(c => c.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryCharge = subtotal > 499 || cart.length === 0 ? 0 : 40;
  const grandTotal = subtotal + deliveryCharge;

  return (
    <div className="page-container narrow margin-top" style={{ maxWidth: '900px' }}>
      <div className="flex-between align-center">
        <h2>Your Shopping Cart ({cart.length} items)</h2>
        <Link to="/" className="btn-outline-sm flex align-center gap-1">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="empty-box card-box margin-top" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <ShoppingCart size={64} className="muted" />
          <h3>Your Shopping Cart is Empty</h3>
          <p className="muted">Add fresh organic vegetables or custom budget combos to get started.</p>
          <Link to="/" className="btn-primary margin-top">Browse Vegetable Store</Link>
        </div>
      ) : (
        <div className="cart-grid-container margin-top">
          {/* Cart Items List */}
          <div className="card-box">
            {cart.map((item, idx) => (
              <div key={idx} className="cart-item-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid #e2e8f0' }}>
                <img src={getImageUrl(item.image)} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.src = FALLBACK_VEG_IMG} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{item.name}</strong>
                  <small className="muted" style={{ display: 'block' }}>{money(item.price)} / {item.unit || 'unit'}</small>
                  {item.customized_items && item.customized_items.length > 0 && (
                    <small className="muted" style={{ color: '#059669', display: 'block', marginTop: '2px' }}>
                      Choices: {item.customized_items.map(c => `${c.name} (${c.qty || '1 kg'})`).join(', ')}
                    </small>
                  )}
                </div>

                <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button className="btn-icon" onClick={() => updateQty(idx, -1)}><Minus size={14} /></button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button className="btn-icon" onClick={() => updateQty(idx, 1)}><Plus size={14} /></button>
                </div>

                <div style={{ textAlign: 'right', minWidth: 70 }}>
                  <b>{money(item.price * item.qty)}</b>
                </div>

                <button className="btn-icon danger" onClick={() => removeItem(idx)} title="Remove Item">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Order Summary Sidebar */}
          <div className="card-box" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Order Summary</h3>
            <div className="margin-top" style={{ fontSize: '0.9rem' }}>
              <div className="flex-between margin-bottom" style={{ margin: '8px 0' }}>
                <span>Subtotal:</span>
                <b>{money(subtotal)}</b>
              </div>
              <div className="flex-between margin-bottom" style={{ margin: '8px 0' }}>
                <span>Delivery Charge:</span>
                <b>{deliveryCharge === 0 ? <span style={{ color: '#059669' }}>FREE</span> : money(deliveryCharge)}</b>
              </div>
              {subtotal < 499 && (
                <small className="muted" style={{ display: 'block', color: '#d97706', margin: '4px 0 12px 0' }}>
                  Add {money(499 - subtotal)} more for FREE Delivery!
                </small>
              )}
              <div className="flex-between" style={{ borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Grand Total:</strong>
                <strong style={{ fontSize: '1.2rem', color: '#059669' }}>{money(grandTotal)}</strong>
              </div>
            </div>

            <button
              className="btn-primary full-width margin-top"
              onClick={() => {
                if (!user) {
                  navigate('/login?redirect=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              style={{ padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
