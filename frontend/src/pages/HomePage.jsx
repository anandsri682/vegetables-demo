import React, { useState, useEffect } from 'react';
import { Sparkles, Box, Plus, Minus, Check, Truck, ShieldCheck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { money, getImageUrl, FALLBACK_VEG_IMG, FALLBACK_PKG_IMG } from '../api/apiClient';

const HERO_SLIDES = [
  {
    badge: '100% ORGANIC & LOCAL FARM PRODUCE',
    title: 'Jamalpur\'s Fresh Vegetable Store',
    sub: 'Directly harvested from local Telangana & Andhra farms. Guaranteed fresh arrival within 2 hours at your doorstep.',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
    tag: 'Daily Fresh Harvest'
  },
  {
    badge: 'SPECIAL FAMILY BUDGET COMBOS',
    title: 'Customizable Weekly Grocery Packages',
    sub: 'Pre-curated vegetable baskets with fixed default staples and customizable vegetable selections.',
    img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80',
    tag: 'Save up to 30%'
  },
  {
    badge: '100% CHEMICAL-FREE GREENERY',
    title: 'Farm Fresh Leafy Greens & Exotic Herbs',
    sub: 'Handpicked organic spinach, coriander, mint, broccoli, and exotic baby corn harvested daily at 5:00 AM.',
    img: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=700&q=80',
    tag: 'Harvested Today'
  }
];

export default function HomePage({ veg, categories, packages, cart, setCart, search, cat, setCat, addVeg, onSelectPackage }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide hero banner every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filteredVeg = veg.filter(v => {
    const mCat = cat === 'All' || v.category_name === cat;
    const mSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category_name.toLowerCase().includes(search.toLowerCase());
    return mCat && mSearch;
  });

  // Helpers to get item qty in cart
  const getCartQty = vegId => {
    const found = cart.find(x => x.type === 'vegetable' && x.id === vegId);
    return found ? found.qty : 0;
  };

  const updateCartQty = (v, delta) => {
    setCart(c => {
      const existingIndex = c.findIndex(x => x.type === 'vegetable' && x.id === v.id);
      if (existingIndex > -1) {
        const next = [...c];
        const newQty = next[existingIndex].qty + delta;
        if (newQty <= 0) return next.filter((_, i) => i !== existingIndex);
        next[existingIndex] = { ...next[existingIndex], qty: newQty };
        return next;
      } else if (delta > 0) {
        return [...c, {
          type: 'vegetable',
          id: v.id,
          name: v.name,
          price: v.price,
          unit: v.unit,
          image: v.image,
          qty: 1
        }];
      }
      return c;
    });
  };

  return (
    <div className="page-container storefront-home margin-top">
      {/* Auto-Sliding Hero Carousel Banner */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-text" style={{ flex: 1 }}>
          <span className="eyebrow"><Sparkles size={14} /> {HERO_SLIDES[currentSlide].badge}</span>
          <h1>{HERO_SLIDES[currentSlide].title}</h1>
          <p>{HERO_SLIDES[currentSlide].sub}</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => {
              const el = document.getElementById('produce-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Fresh Produce &rarr;
            </button>
          </div>
        </div>

        <div className="hero-graphic desktop-only" style={{ flexShrink: 0 }}>
          <img src={HERO_SLIDES[currentSlide].img} alt="Hero Slide" className="hero-img-banner" style={{ transition: 'all 0.5s ease-in-out' }} />
          <span className="harvest-badge">{HERO_SLIDES[currentSlide].tag}</span>
        </div>

        {/* Carousel Navigation Buttons & Dots */}
        <div style={{ position: 'absolute', bottom: '12px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
          <button className="btn-icon" onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} style={{ background: 'rgba(255,255,255,0.8)', border: 'none' }}>
            <ChevronLeft size={16} />
          </button>
          {HERO_SLIDES.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === currentSlide ? '#059669' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
          <button className="btn-icon" onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)} style={{ background: 'rgba(255,255,255,0.8)', border: 'none' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Feature Bar */}
      <div className="features-bar">
        <div className="feature-item">
          <Truck size={24} style={{ color: '#059669', flexShrink: 0 }} />
          <div>
            <strong>Express 2-hr Delivery</strong>
            <small className="muted" style={{ display: 'block' }}>Dispatched from local store branch</small>
          </div>
        </div>
        <div className="feature-item">
          <ShieldCheck size={24} style={{ color: '#059669', flexShrink: 0 }} />
          <div>
            <strong>Zero Chemical Preservatives</strong>
            <small className="muted" style={{ display: 'block' }}>100% organic farm produce</small>
          </div>
        </div>
        <div className="feature-item">
          <Clock size={24} style={{ color: '#059669', flexShrink: 0 }} />
          <div>
            <strong>Daily Harvest at 5:00 AM</strong>
            <small className="muted" style={{ display: 'block' }}>Farm fresh every morning</small>
          </div>
        </div>
      </div>

      {/* Special Budget Packages Grid */}
      {packages.length > 0 && (
        <section className="packages-section margin-top">
          <div className="section-head">
            <h2>Special Budget Vegetable Combos</h2>
            <p className="muted">Pre-curated family grocery packages with customizable vegetable options.</p>
          </div>

          <div className="packages-grid margin-top">
            {packages.map(p => (
              <div key={p.id} className="package-card">
                <div className="pkg-card-banner">
                  <img src={getImageUrl(p.image, FALLBACK_PKG_IMG)} alt={p.name} className="pkg-cover-img" />
                  <span className="pkg-badge">SPECIAL COMBO</span>
                </div>
                <div className="pkg-body">
                  <div className="pkg-header">
                    <h3>{p.name}</h3>
                    <div className="pkg-price">{money(p.price)}</div>
                  </div>
                  <p className="pkg-desc">{p.description}</p>
                  <div className="pkg-defaults-visual" style={{ margin: '10px 0' }}>
                    <small className="muted" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Included Vegetables ({p.default_items || (p.defaultVegetables ? p.defaultVegetables.length : 0)} items):
                    </small>
                    {p.defaultVegetables && p.defaultVegetables.length > 0 ? (
                      <div className="defaults-thumb-strip" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {p.defaultVegetables.map(v => (
                          <div key={v.id} style={{ textAlign: 'center', flexShrink: 0 }} title={`${v.name} (${money(v.price)})`}>
                            <img
                              src={getImageUrl(v.image, FALLBACK_VEG_IMG)}
                              alt={v.name}
                              style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', border: '1px solid #cbd5e1', display: 'block', margin: '0 auto' }}
                            />
                            <span style={{ fontSize: '10px', color: '#475569', display: 'block', maxWidth: '44px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                              {v.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <small className="muted">Package Specs: <b>{p.total_items} Items Total</b> ({p.default_items} Fixed Defaults)</small>
                    )}
                  </div>
                  <button className="btn-primary full-width" onClick={() => onSelectPackage(p)} style={{ marginTop: 'auto' }}>
                    Build & Customize Package &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Pills Filters Bar */}
      <section className="filters-bar margin-top">
        <div className="section-head">
          <h2>Browse Vegetables by Category</h2>
        </div>
        <div className="category-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '16px 0 24px 0' }}>
          <button
            className={`pill ${cat === 'All' ? 'active' : ''}`}
            onClick={() => setCat('All')}
            style={{
              background: cat === 'All' ? '#059669' : '#ffffff',
              color: cat === 'All' ? '#ffffff' : '#334155',
              border: cat === 'All' ? '1px solid #059669' : '1px solid #cbd5e1',
              padding: '10px 20px',
              borderRadius: '24px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: cat === 'All' ? '0 4px 12px rgba(5, 150, 105, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            All Fresh Vegetables <span style={{ opacity: 0.8, fontSize: '0.82rem' }}>({veg.length})</span>
          </button>
          {categories.map(c => {
            const count = veg.filter(v => v.category_name === c.name).length;
            const isActive = cat === c.name;
            return (
              <button
                key={c.id}
                className={`pill ${isActive ? 'active' : ''}`}
                onClick={() => setCat(c.name)}
                style={{
                  background: isActive ? '#059669' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? '1px solid #059669' : '1px solid #cbd5e1',
                  padding: '10px 20px',
                  borderRadius: '24px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(5, 150, 105, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {c.name} <span style={{ opacity: 0.8, fontSize: '0.82rem' }}>({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Produce Grid */}
      <section className="margin-top" id="produce-grid">
        <div className="section-head">
          <h2>Available Produce ({filteredVeg.length})</h2>
        </div>

        {filteredVeg.length === 0 ? (
          <div className="empty-box margin-top card-box">
            <Box size={48} className="muted" />
            <h3>No vegetables found for "{search || cat}"</h3>
            <p className="muted">Try searching for a different item or clear your category filter.</p>
          </div>
        ) : (
          <div className="veg-grid margin-top">
            {filteredVeg.map(v => {
              const inCartQty = getCartQty(v.id);
              const isAvailable = v.stock > 0 && v.availability === 'Available';

              return (
                <div key={v.id} className={`veg-card ${!isAvailable ? 'out-of-stock' : ''}`}>
                  <div className="veg-card-img">
                    <img src={getImageUrl(v.image)} alt={v.name} onError={e => e.target.src = FALLBACK_VEG_IMG} />
                    {v.organic && <span className="discount-tag">ORGANIC</span>}
                    {inCartQty > 0 ? (
                      <span className="status-badge in-stock" style={{ background: '#059669', color: '#ffffff', fontWeight: 800 }}>
                        <Check size={12} inline="true" /> In Cart ({inCartQty})
                      </span>
                    ) : (
                      <span className={`status-badge ${isAvailable ? 'in-stock' : 'sold-out'}`}>
                        {isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                    )}
                  </div>
                  <div className="veg-card-content">
                    <span className="category-tag">{v.category_name}</span>
                    <h3>{v.name}</h3>
                    <div className="veg-footer margin-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div className="price-tag">
                        <b>{money(v.price)}</b> <small>/ {v.unit}</small>
                      </div>

                      {!isAvailable ? (
                        <span className="out-of-stock-tag" style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>Out of Stock</span>
                      ) : inCartQty > 0 ? (
                        /* In Cart Quantity Controls right on product card */
                        <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', padding: '2px 6px', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                          <button className="btn-icon" onClick={() => updateCartQty(v, -1)} style={{ width: 24, height: 24, padding: 0 }} title="Decrease count"><Minus size={12} /></button>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#059669', minWidth: 16, textAlign: 'center' }}>{inCartQty}</span>
                          <button className="btn-icon" onClick={() => updateCartQty(v, 1)} style={{ width: 24, height: 24, padding: 0 }} title="Increase count"><Plus size={12} /></button>
                        </div>
                      ) : (
                        <button
                          className="btn-add-cart"
                          onClick={() => addVeg(v)}
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 16px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Plus size={16} /> Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
