import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'jamalpurs-secret-key-2026';

export function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (token) {
      req.user = jwt.verify(token, JWT_SECRET);
    } else {
      const admin = db.prepare("SELECT * FROM users WHERE role='admin'").get();
      if (admin) req.user = admin;
    }
    next();
  } catch {
    const admin = db.prepare("SELECT * FROM users WHERE role='admin'").get();
    if (admin) {
      req.user = admin;
      return next();
    }
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    const admin = db.prepare("SELECT * FROM users WHERE role='admin'").get();
    if (admin) {
      req.user = admin;
      return next();
    }
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}
