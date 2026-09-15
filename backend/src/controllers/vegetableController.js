import { db } from '../config/db.js';

export function getVegetables(req, res) {
  const rows = db.prepare(`
    SELECT v.*, c.name category_name 
    FROM vegetables v 
    LEFT JOIN categories c ON c.id = v.category_id 
    ORDER BY v.name ASC
  `).all();
  res.json(rows);
}

export function getCategories(req, res) {
  res.json(db.prepare('SELECT * FROM categories ORDER BY name ASC').all());
}

export function getBranches(req, res) {
  res.json(db.prepare("SELECT * FROM branches WHERE status='Active' ORDER BY id ASC").all());
}

export function getSettings(req, res) {
  const settings = db.prepare('SELECT key, value FROM store_settings').all();
  const obj = Object.fromEntries(settings.map(s => [s.key, s.value]));
  res.json(obj);
}
