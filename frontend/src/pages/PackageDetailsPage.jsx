import React, { useState, useEffect } from 'react';
import { XCircle, Check, Sparkles, Plus, Minus } from 'lucide-react';
import { api, money, getImageUrl, FALLBACK_PKG_IMG } from '../api/apiClient';

export default function PackageDetailsPage({ pkg, onClose, onAddToCart }) {
  const [vegs, setVegs] = useState([]);
  const [choices, setChoices] = useState({});

  useEffect(() => {
    if (pkg) {
      api(`/packages/${pkg.id}/choices`)
        .then(data => {
          setVegs(data || []);
          // Auto-preselect defaults up to default_items count
          const initial = {};
          (data || []).slice(0, pkg.default_items || 3).forEach(v => {
            initial[v.id] = 1;
          });
          setChoices(initial);
        })
        .catch(console.error);
    }
  }, [pkg]);

  if (!pkg) return null;

  const totalSelectedCount = Object.values(choices).reduce((sum, q) => sum + (q > 0 ? 1 : 0), 0);
  const remainingChoices = Math.max(0, pkg.total_items - totalSelectedCount);

  const toggleChoice = vegId => {
    setChoices(prev => {
      const current = prev[vegId] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[vegId];
        return next;
      } else {
        if (totalSelectedCount >= pkg.total_items) {
          alert(`You can choose up to ${pkg.total_items} vegetables in this combo package.`);
          return prev;
        }
        return { ...prev, [vegId]: 1 };
      }
    });
  };

  const handleAddComboToCart = () => {
    if (totalSelectedCount < pkg.total_items) {
      if (!confirm(`You have selected ${totalSelectedCount} of ${pkg.total_items} vegetables. Proceed anyway?`)) {
        return;
      }
    }

    const selectedVegList = vegs
      .filter(v => choices[v.id] > 0)
      .map(v => ({
        id: v.id,
        name: v.name,
        qty: '1 kg'
      }));

    onAddToCart({
      type: 'package',
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      qty: 1,
      image: pkg.image,
      customized_items: selectedVegList
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card package-customize-modal" style={{ maxWidth: '720px' }}>
        <div className="flex-between align-center">
          <div>
            <h2>Customize {pkg.name}</h2>
            <small className="muted">{pkg.description}</small>
          </div>
          <button className="btn-icon" onClick={onClose}><XCircle size={22} /></button>
        </div>

        <div className="flex-between align-center margin-top" style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '10px' }}>
          <div>
            <span style={{ color: '#059669', fontWeight: 700 }}>Package Price: {money(pkg.price)}</span>
            <small className="muted" style={{ display: 'block' }}>Pick {pkg.total_items} fresh vegetables for your custom basket</small>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge-admin" style={{ background: remainingChoices === 0 ? '#059669' : '#d97706', color: '#fff', fontSize: '0.85rem' }}>
              {remainingChoices === 0 ? '✓ Basket Complete' : `Pick ${remainingChoices} More Items`}
            </span>
          </div>
        </div>

        <h4 className="margin-top">Available Vegetable Pool ({vegs.length}):</h4>
        <div className="package-veg-pool-grid margin-top" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
          {vegs.map(v => {
            const isSelected = choices[v.id] > 0;
            return (
              <div
                key={v.id}
                onClick={() => toggleChoice(v.id)}
                className="card-box"
                style={{
                  padding: '10px',
                  border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: isSelected ? '#f0fdf4' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <img src={v.image || FALLBACK_PKG_IMG} alt={v.name} style={{ width: 42, height: 42, borderRadius: 6, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.85rem', color: '#0f172a' }}>{v.name}</b>
                  <small className="muted" style={{ display: 'block' }}>1 {v.unit || 'kg'}</small>
                </div>
                {isSelected && <Check size={18} style={{ color: '#059669' }} />}
              </div>
            );
          })}
        </div>

        <div className="flex-between align-center margin-top" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleAddComboToCart}>
            Add Custom Combo to Cart ({money(pkg.price)})
          </button>
        </div>
      </div>
    </div>
  );
}
