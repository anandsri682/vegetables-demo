import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { api, money, getImageUrl, FALLBACK_PKG_IMG, FALLBACK_VEG_IMG } from '../api/apiClient';

export default function CustomizePackagePage({ onAddToCart, showNotice }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [vegs, setVegs] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [limitWarning, setLimitWarning] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api('/packages').catch(() => []),
      api('/vegetables').catch(() => [])
    ])
      .then(([pkgs, produceList]) => {
        if (!isMounted) return;
        const foundPkg = (pkgs || []).find(p => String(p.id) === String(id) || String(p._id) === String(id));
        setPkg(foundPkg || null);
        setVegs(produceList || []);

        // Initial default selections up to 3 items if available
        if (foundPkg && produceList && produceList.length > 0) {
          const initial = {};
          produceList.slice(0, 3).forEach(v => {
            // Pick 1 unit if within package budget
            if (v.price <= foundPkg.price) {
              initial[v.id] = 1;
            }
          });
          setQuantities(initial);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="page-container narrow margin-top" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p className="muted">Loading package customization page...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="page-container narrow margin-top" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Package size={48} className="muted" />
        <h2>Package Not Found</h2>
        <button className="btn-primary margin-top" onClick={() => navigate('/')}>Return to Store</button>
      </div>
    );
  }

  // Calculate totals and budget stats
  const packageBudget = Number(pkg.price || 0);

  const selectedTotal = Object.entries(quantities).reduce((sum, [vegId, qty]) => {
    if (qty <= 0) return sum;
    const v = vegs.find(x => String(x.id) === String(vegId) || String(x._id) === String(vegId));
    return sum + (v ? Number(v.price || 0) * qty : 0);
  }, 0);

  const remainingBudget = packageBudget - selectedTotal;
  const isOverBudget = selectedTotal > packageBudget;
  const exceededAmount = isOverBudget ? selectedTotal - packageBudget : 0;

  // Quantity Control with Automatic Budget Clamping
  const handleQuantityChange = (veg, delta) => {
    setLimitWarning(null);
    const vegId = veg.id || veg._id;
    const currentQty = quantities[vegId] || 0;
    const unitPrice = Number(veg.price || 0);

    if (delta > 0) {
      // Calculate remaining budget available BEFORE this item's current qty
      const otherItemsTotal = selectedTotal - (currentQty * unitPrice);
      const availableBudgetForItem = packageBudget - otherItemsTotal;

      if (availableBudgetForItem <= 0) {
        setLimitWarning(`Cannot add ${veg.name} — package budget of ${money(packageBudget)} reached.`);
        return;
      }

      // Maximum affordable units that fit within remaining budget
      const maxAffordableQty = Math.floor(availableBudgetForItem / unitPrice);

      if (currentQty >= maxAffordableQty) {
        const affordableQty = Math.max(0, maxAffordableQty);
        setQuantities(prev => ({ ...prev, [vegId]: affordableQty }));
        setLimitWarning(`Auto-adjusted ${veg.name} to ${affordableQty} ${veg.unit || 'kg'} to fit ${money(packageBudget)} package limit.`);
        return;
      }

      const nextQty = Math.min(currentQty + delta, maxAffordableQty, veg.stock || 99);
      setQuantities(prev => ({ ...prev, [vegId]: nextQty }));
    } else {
      const nextQty = Math.max(0, currentQty + delta);
      setQuantities(prev => {
        const copy = { ...prev };
        if (nextQty === 0) delete copy[vegId];
        else copy[vegId] = nextQty;
        return copy;
      });
    }
  };

  const handleAddToCart = () => {
    if (isOverBudget) {
      alert(`Your selected products exceed the ${money(packageBudget)} package limit by ${money(exceededAmount)}. Please adjust product quantities.`);
      return;
    }

    const selectedVegList = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([vegId, qty]) => {
        const v = vegs.find(x => String(x.id) === String(vegId) || String(x._id) === String(vegId));
        return {
          id: vegId,
          vegetable_id: vegId,
          name: v?.name || 'Fresh Produce',
          name_snapshot: v?.name || 'Fresh Produce',
          qty: `${qty} ${v?.unit || 'kg'}`,
          quantity_snapshot: `${qty} ${v?.unit || 'kg'}`,
          quantity: qty,
          price: v?.price || 0,
          unit: v?.unit || 'kg'
        };
      });

    if (selectedVegList.length === 0) {
      alert('Please select at least one vegetable item for your customized package.');
      return;
    }

    if (onAddToCart) {
      onAddToCart({
        type: 'package',
        id: pkg.id,
        name: `${pkg.name} (Custom)`,
        price: packageBudget,
        qty: 1,
        image: pkg.image,
        customized_items: selectedVegList
      });
    }

    if (showNotice) {
      showNotice(`Added customized ${pkg.name} combo to your cart!`);
    }
    navigate('/cart');
  };

  return (
    <div className="page-container margin-top" style={{ maxWidth: '960px' }}>
      <button className="btn-outline-sm margin-bottom" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Store
      </button>

      <div className="card-box" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', color: '#0f172a', margin: '4px 0' }}>Customize Your Package: {pkg.name}</h2>
        <p className="muted" style={{ fontSize: '0.9rem', margin: '4px 0 16px 0' }}>
          {pkg.description || 'Select produce items below to build your custom basket within the package budget limit.'}
        </p>

        {/* Live Budget Counter Bar */}
        <div style={{
          background: isOverBudget ? '#fef2f2' : '#ecfdf5',
          border: isOverBudget ? '2px solid #f87171' : '2px solid #a7f3d0',
          padding: '16px 20px',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          transition: 'all 0.3s ease'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isOverBudget ? '#991b1b' : '#065f46' }}>
              PACKAGE BUDGET: {money(packageBudget)}
            </div>
            <div style={{ fontSize: '0.85rem', color: isOverBudget ? '#991b1b' : '#047857', marginTop: '2px' }}>
              Selected Total: <b>{money(selectedTotal)}</b>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {isOverBudget ? (
              <span className="badge-admin" style={{ background: '#ef4444', color: '#fff', fontSize: '0.9rem', padding: '6px 14px', borderRadius: '20px', fontWeight: 800 }}>
                ⚠️ Exceeded: {money(exceededAmount)} over package limit!
              </span>
            ) : (
              <span className="badge-admin" style={{ background: '#059669', color: '#fff', fontSize: '0.9rem', padding: '6px 14px', borderRadius: '20px', fontWeight: 800 }}>
                Remaining Budget: {money(remainingBudget)}
              </span>
            )}
          </div>
        </div>

        {/* Limit Alert Warning Toast */}
        {limitWarning && (
          <div style={{ marginTop: '12px', background: '#fffbe6', border: '1px solid #ffe58f', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#d48806', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {limitWarning}
          </div>
        )}

        {/* Available Vegetables Selection Grid */}
        <h3 style={{ fontSize: '1.1rem', margin: '24px 0 12px 0', color: '#0f172a' }}>
          Select Produce Items ({vegs.length} items available)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {vegs.map(v => {
            const vegId = v.id || v._id;
            const currentQty = quantities[vegId] || 0;
            const isSelected = currentQty > 0;

            return (
              <div
                key={vegId}
                className="card-box"
                style={{
                  border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: isSelected ? '#f0fdf4' : '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <img
                  src={getImageUrl(v.image)}
                  alt={v.name}
                  style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', border: '1px solid #cbd5e1', flexShrink: 0 }}
                  onError={e => e.target.src = FALLBACK_VEG_IMG}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>{v.name}</b>
                  <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>{money(v.price)} / {v.unit || 'kg'}</span>
                  {currentQty > 0 && (
                    <small style={{ display: 'block', color: '#475569', fontSize: '0.78rem', marginTop: '2px' }}>
                      Subtotal: <b>{money(v.price * currentQty)}</b>
                    </small>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '2px 6px' }}>
                  <button className="btn-icon" onClick={() => handleQuantityChange(v, -1)} disabled={currentQty <= 0}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 800, minWidth: 18, textAlign: 'center', fontSize: '0.88rem' }}>{currentQty}</span>
                  <button className="btn-icon" onClick={() => handleQuantityChange(v, 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Customization Summary Footer Box */}
        <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginTop: '24px' }}>
          <div className="flex-between align-center" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Customized Package Summary</h3>
              <small className="muted">
                {Object.values(quantities).reduce((s, q) => s + q, 0)} total items selected for {money(packageBudget)} combo
              </small>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem' }}>
                Selected Total: <strong style={{ color: isOverBudget ? '#ef4444' : '#059669', fontSize: '1.2rem' }}>{money(selectedTotal)}</strong>
              </div>
              {isOverBudget ? (
                <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem' }}>
                  Over package limit by {money(exceededAmount)}
                </div>
              ) : (
                <div style={{ color: '#047857', fontWeight: 700, fontSize: '0.85rem' }}>
                  Remaining: {money(remainingBudget)}
                </div>
              )}
            </div>
          </div>

          <button
            className="btn-primary full-width"
            onClick={handleAddToCart}
            disabled={isOverBudget || selectedTotal === 0}
            style={{
              padding: '14px',
              fontSize: '1rem',
              opacity: isOverBudget || selectedTotal === 0 ? 0.5 : 1,
              cursor: isOverBudget || selectedTotal === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShoppingCart size={18} />
            {isOverBudget
              ? `Adjust Quantities (Over Budget by ${money(exceededAmount)})`
              : `Add Customized Package to Cart (${money(packageBudget)})`}
          </button>
        </div>
      </div>
    </div>
  );
}
