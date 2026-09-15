import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { initDatabase, db } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import vegetableRoutes from './routes/vegetableRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Database Schema
await initDatabase();

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT NOT NULL, 
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, 
  role TEXT NOT NULL DEFAULT 'customer', 
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  pin TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT UNIQUE NOT NULL,
  image TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS vegetables (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT NOT NULL, 
  category_id INTEGER, 
  description TEXT,
  price REAL NOT NULL, 
  unit TEXT NOT NULL DEFAULT 'kg', 
  stock REAL NOT NULL DEFAULT 50,
  availability TEXT NOT NULL DEFAULT 'Available', 
  featured INTEGER DEFAULT 0, 
  discount REAL DEFAULT 0,
  image TEXT DEFAULT '', 
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, 
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT NOT NULL, 
  price REAL NOT NULL, 
  total_items INTEGER NOT NULL,
  default_items INTEGER NOT NULL, 
  description TEXT, 
  image TEXT DEFAULT '', 
  active INTEGER DEFAULT 1,
  allow_duplicates INTEGER DEFAULT 0, 
  price_adjustment REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS package_default_items (
  package_id INTEGER, 
  vegetable_id INTEGER, 
  PRIMARY KEY(package_id, vegetable_id)
);

CREATE TABLE IF NOT EXISTS package_customizable_items (
  package_id INTEGER, 
  vegetable_id INTEGER, 
  PRIMARY KEY(package_id, vegetable_id)
);

CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  customer_id INTEGER, 
  customer_name TEXT NOT NULL, 
  phone TEXT NOT NULL,
  email TEXT, 
  address TEXT NOT NULL, 
  city TEXT NOT NULL, 
  pin TEXT NOT NULL, 
  instructions TEXT,
  subtotal REAL NOT NULL, 
  delivery_charge REAL NOT NULL DEFAULT 0, 
  discount REAL DEFAULT 0, 
  total REAL NOT NULL,
  payment_method TEXT DEFAULT 'COD', 
  payment_status TEXT DEFAULT 'Pending',
  status TEXT DEFAULT 'New', 
  tracking_updates TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  order_id INTEGER NOT NULL, 
  vegetable_id INTEGER, 
  package_id INTEGER,
  name_snapshot TEXT NOT NULL, 
  quantity REAL DEFAULT 1, 
  unit_snapshot TEXT DEFAULT 'kg',
  price REAL NOT NULL, 
  item_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customized_package_items (
  order_item_id INTEGER NOT NULL, 
  vegetable_id INTEGER NOT NULL, 
  name_snapshot TEXT NOT NULL,
  quantity_snapshot TEXT DEFAULT '1 kg',
  PRIMARY KEY(order_item_id, vegetable_id)
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  user_id INTEGER NOT NULL, 
  tag TEXT NOT NULL DEFAULT 'Home', 
  name TEXT DEFAULT '', 
  phone TEXT DEFAULT '', 
  address TEXT NOT NULL, 
  city TEXT NOT NULL, 
  pin TEXT NOT NULL, 
  is_default INTEGER DEFAULT 0, 
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// Seed Admin Account
const admin = db.prepare('SELECT id FROM users WHERE role=?').get('admin');
if (!admin) {
  db.prepare('INSERT INTO users(name,email,password_hash,role,phone,address,city,pin) VALUES(?,?,?,?,?,?,?,?)')
    .run('Store Admin', 'admin@jamalpurs.local', bcrypt.hashSync('Admin@123', 10), 'admin', '9876543210', '123 Market Road', 'Freshville', '500001');
}

// Mount Modular ES Routers
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Address routes
app.use('/api', vegetableRoutes);
app.use('/api', packageRoutes);
app.use('/api', orderRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Jamalpur's Modular API active on http://0.0.0.0:${PORT}`));
