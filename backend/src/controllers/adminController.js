import { db } from '../config/db.js';

export function getStats(req, res) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total), 0) total FROM orders WHERE status != 'Cancelled'").get().total;
  const todayRevenue = db.prepare("SELECT COALESCE(SUM(total), 0) total FROM orders WHERE status != 'Cancelled' AND created_at LIKE ?").get(`${todayStr}%`).total;
  
  const totalOrders = db.prepare('SELECT COUNT(*) c FROM orders').get().c;
  const todayOrders = db.prepare('SELECT COUNT(*) c FROM orders WHERE created_at LIKE ?').get(`${todayStr}%`).c;
  const pendingOrders = db.prepare("SELECT COUNT(*) c FROM orders WHERE status IN ('New','Confirmed','Preparing')").get().c;
  const deliveredOrders = db.prepare("SELECT COUNT(*) c FROM orders WHERE status='Delivered'").get().c;

  const totalVegetables = db.prepare('SELECT COUNT(*) c FROM vegetables').get().c;
  const activeProducts = db.prepare("SELECT COUNT(*) c FROM vegetables WHERE availability='Available' AND stock > 0").get().c;
  const outOfStockProducts = db.prepare("SELECT COUNT(*) c FROM vegetables WHERE availability='Out of Stock' OR stock <= 0").get().c;
  const unavailableProducts = db.prepare("SELECT COUNT(*) c FROM vegetables WHERE availability='Temporarily Unavailable'").get().c;
  const totalPackages = db.prepare('SELECT COUNT(*) c FROM packages WHERE active=1').get().c;
  const totalCustomers = db.prepare("SELECT COUNT(*) c FROM users WHERE role='customer'").get().c;
  const totalBranches = db.prepare("SELECT COUNT(*) c FROM branches").get().c;

  const topSelling = db.prepare(`
    SELECT name_snapshot as name, SUM(quantity) as total_qty, SUM(price * quantity) as total_sales
    FROM order_items 
    WHERE item_type = 'vegetable' 
    GROUP BY name_snapshot 
    ORDER BY total_qty DESC 
    LIMIT 5
  `).all();

  res.json({
    totalRevenue,
    todayRevenue,
    totalOrders,
    todayOrders,
    pendingOrders,
    deliveredOrders,
    totalVegetables,
    activeProducts,
    outOfStockProducts,
    unavailableProducts,
    totalPackages,
    totalCustomers,
    totalBranches,
    topSelling
  });
}

export function getAdminOrders(req, res) {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const getItems = db.prepare(`
    SELECT oi.*, COALESCE(v.image, p.image, '') as image 
    FROM order_items oi 
    LEFT JOIN vegetables v ON v.id = oi.vegetable_id 
    LEFT JOIN packages p ON p.id = oi.package_id 
    WHERE oi.order_id = ?
  `);
  const getChoices = db.prepare('SELECT * FROM customized_package_items WHERE order_item_id = ?');

  const fullOrders = orders.map(o => {
    const items = getItems.all(o.id).map(item => {
      if (item.item_type === 'package') {
        return {
          ...item,
          customized_items: getChoices.all(item.id)
        };
      }
      return item;
    });
    return {
      ...o,
      tracking_updates: JSON.parse(o.tracking_updates || '[]'),
      items
    };
  });

  res.json(fullOrders);
}

export function updateOrderStatus(req, res) {
  const { status, note } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const existingTracking = JSON.parse(order.tracking_updates || '[]');
  const newTracking = [...existingTracking, {
    status: status || order.status,
    note: note || `Order status updated to ${status || order.status}`,
    time: new Date().toISOString()
  }];

  db.prepare('UPDATE orders SET status = ?, tracking_updates = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status || order.status, JSON.stringify(newTracking), req.params.id);

  res.json({ success: true, message: `Order status updated to ${status || order.status}` });
}

export function createVegetable(req, res) {
  const { name, category_id, description, price, unit = 'kg', stock = 50, availability = 'Available', featured = 0, discount = 0, image } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: 'Vegetable name and price are required' });
  if (!image || !image.trim()) return res.status(400).json({ error: 'Product image is mandatory. Please upload an image file or provide an image URL.' });

  const r = db.prepare(`
    INSERT INTO vegetables (name, category_id, description, price, unit, stock, availability, featured, discount, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, category_id || 1, description || '', price, unit, stock, availability, featured ? 1 : 0, discount, image.trim());

  res.json({ success: true, id: r.lastInsertRowid });
}

export function updateVegetable(req, res) {
  const { name, category_id, description, price, unit, stock, availability, featured, discount, image } = req.body;
  const v = db.prepare('SELECT * FROM vegetables WHERE id = ?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'Vegetable not found' });

  if (image !== undefined && (!image || !image.trim())) {
    return res.status(400).json({ error: 'Product image cannot be empty. Please upload an image file or URL.' });
  }

  db.prepare(`
    UPDATE vegetables SET
      name = COALESCE(?, name),
      category_id = COALESCE(?, category_id),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      unit = COALESCE(?, unit),
      stock = COALESCE(?, stock),
      availability = COALESCE(?, availability),
      featured = COALESCE(?, featured),
      discount = COALESCE(?, discount),
      image = COALESCE(?, image),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name, category_id, description, price, unit, stock, availability,
    featured !== undefined ? (featured ? 1 : 0) : undefined,
    discount, image ? image.trim() : undefined, req.params.id
  );

  res.json({ success: true });
}

export function deleteVegetable(req, res) {
  db.prepare('DELETE FROM vegetables WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

export function getAdminPackages(req, res) {
  const packages = db.prepare('SELECT * FROM packages ORDER BY id DESC').all();
  const getDefaults = db.prepare('SELECT vegetable_id FROM package_default_items WHERE package_id = ?');
  const getCustoms = db.prepare('SELECT vegetable_id FROM package_customizable_items WHERE package_id = ?');

  const full = packages.map(p => ({
    ...p,
    default_items: getDefaults.all(p.id).map(x => x.vegetable_id),
    customizable_items: getCustoms.all(p.id).map(x => x.vegetable_id)
  }));
  res.json(full);
}

export function createPackage(req, res) {
  const { name, price, total_items = 5, default_items = 2, description, image, active = 1, default_vegetable_ids = [], customizable_vegetable_ids = [] } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Package name and price are required' });

  const r = db.prepare(`
    INSERT INTO packages(name, price, total_items, default_items, description, image, active)
    VALUES(?,?,?,?,?,?,?)
  `).run(name, price, total_items, default_items, description || '', image || '', active ? 1 : 0);

  const pkgId = r.lastInsertRowid;
  const insDef = db.prepare('INSERT INTO package_default_items(package_id, vegetable_id) VALUES(?,?)');
  const insCust = db.prepare('INSERT INTO package_customizable_items(package_id, vegetable_id) VALUES(?,?)');

  for (const vid of default_vegetable_ids) insDef.run(pkgId, vid);
  for (const vid of customizable_vegetable_ids) insCust.run(pkgId, vid);

  res.json({ success: true, id: pkgId });
}

export function updatePackage(req, res) {
  const { name, price, total_items, default_items, description, image, active, default_vegetable_ids, customizable_vegetable_ids } = req.body;
  const pkgId = req.params.id;

  db.prepare(`
    UPDATE packages SET
      name = COALESCE(?, name),
      price = COALESCE(?, price),
      total_items = COALESCE(?, total_items),
      default_items = COALESCE(?, default_items),
      description = COALESCE(?, description),
      image = COALESCE(?, image),
      active = COALESCE(?, active)
    WHERE id = ?
  `).run(name, price, total_items, default_items, description, image, active !== undefined ? (active ? 1 : 0) : undefined, pkgId);

  if (Array.isArray(default_vegetable_ids)) {
    db.prepare('DELETE FROM package_default_items WHERE package_id = ?').run(pkgId);
    const insDef = db.prepare('INSERT INTO package_default_items(package_id, vegetable_id) VALUES(?,?)');
    for (const vid of default_vegetable_ids) insDef.run(pkgId, vid);
  }

  if (Array.isArray(customizable_vegetable_ids)) {
    db.prepare('DELETE FROM package_customizable_items WHERE package_id = ?').run(pkgId);
    const insCust = db.prepare('INSERT INTO package_customizable_items(package_id, vegetable_id) VALUES(?,?)');
    for (const vid of customizable_vegetable_ids) insCust.run(pkgId, vid);
  }

  res.json({ success: true });
}

export function deletePackage(req, res) {
  db.prepare('DELETE FROM packages WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM package_default_items WHERE package_id = ?').run(req.params.id);
  db.prepare('DELETE FROM package_customizable_items WHERE package_id = ?').run(req.params.id);
  res.json({ success: true });
}

export function getAdminBranches(req, res) {
  res.json(db.prepare('SELECT * FROM branches ORDER BY id ASC').all());
}

export function createBranch(req, res) {
  const { name, location, phone, status = 'Active' } = req.body;
  if (!name || !location) return res.status(400).json({ error: 'Branch name and location are required' });
  const r = db.prepare('INSERT INTO branches(name, location, phone, status) VALUES(?,?,?,?)').run(name, location, phone || '', status);
  res.json({ success: true, id: r.lastInsertRowid });
}

export function deleteBranch(req, res) {
  db.prepare('DELETE FROM branches WHERE id = ?').run(req.params.id);
  res.json({ success: true });
}

export function getAdminSettings(req, res) {
  const rows = db.prepare('SELECT key, value FROM store_settings').all();
  res.json(Object.fromEntries(rows.map(x => [x.key, x.value])));
}

export function saveAdminSettings(req, res) {
  const upsert = db.prepare('INSERT INTO store_settings(key, value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  for (const [k, v] of Object.entries(req.body)) {
    upsert.run(k, String(v));
  }
  res.json({ success: true, message: 'Settings saved' });
}

export function getAdminNotifications(req, res) {
  res.json(db.prepare('SELECT * FROM notifications ORDER BY id DESC LIMIT 20').all());
}

export function getAdminCustomers(req, res) {
  const users = db.prepare("SELECT id, name, email, role, phone, address, city, pin, created_at FROM users WHERE role='customer' ORDER BY id DESC").all();
  res.json(users);
}
