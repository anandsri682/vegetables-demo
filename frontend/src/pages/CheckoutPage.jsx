import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api, money } from '../api/apiClient';

export default function CheckoutPage({ cart, setCart, user, onOrderPlaced }) {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    api('/user/addresses')
      .then(addrs => {
        setAddresses(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) setSelectedAddrId(def.id);
      })
      .catch(console.error);
  }, [user]);

  if (cart.length === 0) {
    return (
      <div className="page-container narrow margin-top" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <button className="btn-primary margin-top" onClick={() => navigate('/')}>Return to Store</button>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryCharge = subtotal > 499 ? 0 : 40;
  const grandTotal = subtotal + deliveryCharge;

  const handlePlaceOrder = async e => {
    e.preventDefault();
    const selAddr = addresses.find(a => a.id === selectedAddrId);

    const custName = selAddr?.name || user.name;
    const custPhone = selAddr?.phone || user.phone;
    const custAddr = selAddr?.address || user.address;
    const custCity = selAddr?.city || user.city;
    const custPin = selAddr?.pin || user.pin;

    if (!custName || !custPhone || !custAddr || !custCity || !custPin) {
      alert('Please select or add a complete delivery address first.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer: {
          name: custName,
          phone: custPhone,
          email: user.email,
          address: custAddr,
          city: custCity,
          pin: custPin,
          instructions
        },
        customer_name: custName,
        phone: custPhone,
        email: user.email,
        address: custAddr,
        city: custCity,
        pin: custPin,
        payment_method: paymentMethod,
        paymentMethod: paymentMethod,
        instructions,
        deliveryCharge,
        items: cart.map(item => ({
          type: item.type,
          vegetableId: item.type === 'vegetable' ? item.id : null,
          packageId: item.type === 'package' ? item.id : null,
          vegetable_id: item.type === 'vegetable' ? item.id : null,
          package_id: item.type === 'package' ? item.id : null,
          id: item.id,
          name_snapshot: item.name,
          unit_snapshot: item.unit || 'unit',
          price: item.price,
          quantity: item.qty,
          image: item.image,
          customSelections: item.customized_items || [],
          customized_items: item.customized_items || []
        }))
      };

      const res = await api('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setCart([]);
      onOrderPlaced(res.orderId);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container narrow margin-top" style={{ maxWidth: '900px' }}>
      <button className="btn-outline-sm margin-bottom" onClick={() => navigate('/cart')}>
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <h2>Express Checkout & Delivery Details</h2>

      <form onSubmit={handlePlaceOrder} className="checkout-grid-container margin-top">
        <div>
          {/* Address Selector */}
          <div className="card-box">
            <div className="flex-between align-center">
              <h3>1. Select Delivery Address</h3>
              <button type="button" className="btn-link" onClick={() => navigate('/addresses')}>
                + Manage Addresses
              </button>
            </div>

            {addresses.length > 0 ? (
              <div className="margin-top flex flex-col gap-2">
                {addresses.map(a => (
                  <label key={a.id} className="card-box" style={{ border: selectedAddrId === a.id ? '2px solid #059669' : '1px solid #cbd5e1', cursor: 'pointer', padding: '12px', display: 'block', marginBottom: '8px' }}>
                    <div className="flex align-center gap-2" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <input type="radio" name="address" checked={selectedAddrId === a.id} onChange={() => setSelectedAddrId(a.id)} style={{ marginTop: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <b>{a.name} ({a.tag})</b>
                        <p className="muted" style={{ margin: '2px 0', fontSize: '0.85rem', wordBreak: 'break-word' }}>{a.address}, {a.city} ({a.pin})</p>
                        <small className="muted">Phone: {a.phone}</small>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="margin-top card-box" style={{ background: '#f8fafc', padding: '14px' }}>
                <b>Primary Account Address:</b>
                <p className="muted" style={{ margin: '4px 0', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                  {user.address ? `${user.address}, ${user.city} (${user.pin})` : 'No delivery address saved in account.'}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card-box margin-top">
            <h3>2. Payment Method</h3>
            <div className="margin-top flex flex-col gap-2">
              <label className="card-box" style={{ border: paymentMethod === 'COD' ? '2px solid #059669' : '1px solid #cbd5e1', cursor: 'pointer', padding: '12px', display: 'block', marginBottom: '8px' }}>
                <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <span style={{ fontWeight: 700, marginLeft: '8px' }}>Cash on Delivery (COD)</span>
                <small className="muted" style={{ display: 'block', marginLeft: '24px' }}>Pay cash or UPI on doorstep arrival</small>
              </label>

              <label className="card-box" style={{ border: paymentMethod === 'UPI' ? '2px solid #059669' : '1px solid #cbd5e1', cursor: 'pointer', padding: '12px', display: 'block' }}>
                <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                <span style={{ fontWeight: 700, marginLeft: '8px' }}>Google Pay / PhonePe / PayTM (Instant UPI)</span>
              </label>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="card-box margin-top">
            <h3>3. Delivery Instructions (Optional)</h3>
            <textarea
              rows={2}
              className="margin-top full-width"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Leave at security gate, call before arrival..."
            />
          </div>
        </div>

        {/* Right Order Review Box */}
        <div className="card-box" style={{ height: 'fit-content' }}>
          <h3>Order Overview ({cart.length} items)</h3>
          <div className="margin-top" style={{ maxHeight: 200, overflowY: 'auto', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            {cart.map((item, idx) => (
              <div key={idx} className="flex-between align-center" style={{ margin: '6px 0', fontSize: '0.85rem' }}>
                <span>{item.name} (x{item.qty})</span>
                <b>{money(item.price * item.qty)}</b>
              </div>
            ))}
          </div>

          <div className="margin-top" style={{ fontSize: '0.9rem' }}>
            <div className="flex-between margin-bottom" style={{ margin: '6px 0' }}>
              <span>Subtotal:</span>
              <b>{money(subtotal)}</b>
            </div>
            <div className="flex-between margin-bottom" style={{ margin: '6px 0' }}>
              <span>Delivery Charge:</span>
              <b>{deliveryCharge === 0 ? <span style={{ color: '#059669' }}>FREE</span> : money(deliveryCharge)}</b>
            </div>
            <div className="flex-between" style={{ borderTop: '2px solid #e2e8f0', paddingTop: '10px', marginTop: '10px' }}>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Total Payable:</strong>
              <strong style={{ fontSize: '1.2rem', color: '#059669' }}>{money(grandTotal)}</strong>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary full-width margin-top"
            disabled={loading}
            style={{ padding: '14px', fontSize: '1rem' }}
          >
            {loading ? 'Processing Order...' : 'Confirm & Place Order Now'}
          </button>
        </div>
      </form>
    </div>
  );
}
