import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export function register(req, res) {
  const { name, email, password, phone, address, city, pin } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Account with this email already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, phone, address, city, pin)
    VALUES (?, ?, ?, 'customer', ?, ?, ?, ?)
  `).run(name, email, hash, phone || '', address || '', city || 'Hyderabad', pin || '');

  const user = db.prepare('SELECT id, name, email, role, phone, address, city, pin FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user });
}

export function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      city: user.city,
      pin: user.pin
    }
  });
}

export function getProfile(req, res) {
  const user = db.prepare('SELECT id, name, email, role, phone, address, city, pin FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

export function updateProfile(req, res) {
  const { name, phone, address, city, pin } = req.body;
  db.prepare(`
    UPDATE users SET name = ?, phone = ?, address = ?, city = ?, pin = ? WHERE id = ?
  `).run(name, phone, address, city, pin, req.user.id);

  const updated = db.prepare('SELECT id, name, email, role, phone, address, city, pin FROM users WHERE id = ?').get(req.user.id);
  res.json(updated);
}

export function getAddresses(req, res) {
  const rows = db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(req.user.id);
  res.json(rows);
}

export function addAddress(req, res) {
  const { tag = 'Home', name, phone, address, city, pin, is_default } = req.body;
  if (!address || !city || !pin) {
    return res.status(400).json({ error: 'Address, city, and pincode are required.' });
  }

  if (is_default) {
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  }

  const result = db.prepare(`
    INSERT INTO user_addresses (user_id, tag, name, phone, address, city, pin, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, tag, name || '', phone || '', address, city, pin, is_default ? 1 : 0);

  res.json(db.prepare('SELECT * FROM user_addresses WHERE id = ?').get(result.lastInsertRowid));
}

export function updateAddress(req, res) {
  const { tag, name, phone, address, city, pin, is_default } = req.body;
  const target = db.prepare('SELECT * FROM user_addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!target) return res.status(404).json({ error: 'Address record not found.' });

  if (is_default) {
    db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  }

  db.prepare(`
    UPDATE user_addresses 
    SET tag=?, name=?, phone=?, address=?, city=?, pin=?, is_default=? 
    WHERE id=? AND user_id=?
  `).run(
    tag || target.tag,
    name || target.name,
    phone || target.phone,
    address || target.address,
    city || target.city,
    pin || target.pin,
    is_default !== undefined ? (is_default ? 1 : 0) : target.is_default,
    req.params.id,
    req.user.id
  );

  res.json(db.prepare('SELECT * FROM user_addresses WHERE id = ?').get(req.params.id));
}

export function deleteAddress(req, res) {
  const target = db.prepare('SELECT * FROM user_addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!target) return res.status(404).json({ error: 'Address record not found.' });

  db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

  if (target.is_default) {
    const nextAddr = db.prepare('SELECT id FROM user_addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(req.user.id);
    if (nextAddr) {
      db.prepare('UPDATE user_addresses SET is_default = 1 WHERE id = ?').run(nextAddr.id);
    }
  }

  res.json({ success: true, message: 'Address removed successfully.' });
}

export function setDefaultAddress(req, res) {
  const target = db.prepare('SELECT * FROM user_addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!target) return res.status(404).json({ error: 'Address record not found.' });

  db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  db.prepare('UPDATE user_addresses SET is_default = 1 WHERE id = ?').run(req.params.id);

  res.json({ success: true, message: 'Default delivery address updated.' });
}

export function deleteAccount(req, res) {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password confirmation is required to delete account.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect password. Account deletion aborted.' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  res.json({ success: true, message: 'Account deleted successfully.' });
}
