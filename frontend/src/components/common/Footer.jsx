import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer({ settings }) {
  return (
    <footer className="main-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <div className="footer-brand">
            <img src="/logo.png" alt="Jamalpur's" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <span>Jamalpur's Market</span>
          </div>
          <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
            Delivering 100% farm-fresh, organic vegetables and budget family combos directly to your kitchen within 2 hours.
          </p>
        </div>

        <div className="footer-col">
          <h4>Quick Store Navigation</h4>
          <ul>
            <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Fresh Vegetables</Link></li>
            <li><Link to="/orders" style={{ color: 'inherit', textDecoration: 'none' }}>Order History</Link></li>
            <li><Link to="/addresses" style={{ color: 'inherit', textDecoration: 'none' }}>Delivery Addresses</Link></li>
            <li><Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>My Account</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Store Hours & Location</h4>
          <ul>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Open Daily: 6:00 AM - 10:00 PM</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> Helpline: {settings.support_phone || '+91 98765 43210'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Location: Jamalpur Central Market</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Express Delivery Guarantee</h4>
          <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
            Harvested daily at 5:00 AM from local Telangana & Andhra farms. Free delivery on orders above ₹499.
          </p>
        </div>
      </div>
      <div className="footer-bottom" style={{ textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '20px', fontSize: '0.8rem', color: '#64748b' }}>
        <p>&copy; {new Date().getFullYear()} Jamalpur's Vegetable Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
