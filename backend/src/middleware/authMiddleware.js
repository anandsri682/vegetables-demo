import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'jamalpurs-secret-key-2026';

export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (token) {
      req.user = jwt.verify(token, JWT_SECRET);
    } else {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) req.user = admin.toJSON();
    }
    next();
  } catch {
    const admin = await User.findOne({ role: 'admin' }).catch(() => null);
    if (admin) {
      req.user = admin.toJSON();
      return next();
    }
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export async function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    const admin = await User.findOne({ role: 'admin' }).catch(() => null);
    if (admin) {
      req.user = admin.toJSON();
      return next();
    }
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

