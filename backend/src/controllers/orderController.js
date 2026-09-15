import { db } from '../config/db.js';

export function createOrder(req, res) {
  const body = req.body;
  const customer = body.customer || {
    name: body.customer_name || body.name,
    phone: body.phone,
    email: body.email,
    address: body.address,
    city: body.city,
    pin: body.pin,
    instructions: body.instructions
  };
  const items = body.items || [];
  const deliveryCharge = body.deliveryCharge ?? body.delivery_charge ?? 0;
  const discount = body.discount || 0;
  const paymentMethod = body.paymentMethod || body.payment_method || 'COD';

  if (!customer?.name || !customer?.phone || !customer?.address || !customer?.city || !customer?.pin) {
    return res.status(400).json({ error: 'Complete delivery and billing details are required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }

  const processOrder = db.transaction(() => {
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      let vegId = item.vegetableId || item.vegetable_id;
      let pkgId = item.packageId || item.package_id;
      let itemType = item.type;

      if (!itemType) {
        if (pkgId) itemType = 'package';
        else if (vegId) itemType = 'vegetable';
        else {
          // Check if item.id matches package or vegetable
          const checkPkg = db.prepare('SELECT id FROM packages WHERE id = ?').get(item.id);
          if (checkPkg) {
            itemType = 'package';
            pkgId = item.id;
          } else {
            itemType = 'vegetable';
            vegId = item.id;
          }
        }
      }

      if (!vegId && itemType === 'vegetable') vegId = item.id;
      if (!pkgId && itemType === 'package') pkgId = item.id;

      if (itemType === 'vegetable') {
        const v = db.prepare('SELECT * FROM vegetables WHERE id = ?').get(vegId);
        if (!v) throw new Error(`Vegetable with ID ${vegId || item.id} not found`);
        if (v.availability !== 'Available' || v.stock < (item.quantity || 1)) {
          throw new Error(`"${v.name}" is currently unavailable or out of stock`);
        }
        const effectivePrice = v.price * (1 - (v.discount || 0) / 100);
        const qty = item.quantity || item.qty || 1;
        subtotal += effectivePrice * qty;

        // Deduct stock for single vegetable orders
        db.prepare('UPDATE vegetables SET stock = stock - ? WHERE id = ?').run(qty, v.id);

        validatedItems.push({
          type: 'vegetable',
          vegetableId: v.id,
          name: v.name,
          unit: v.unit,
          quantity: qty,
          price: effectivePrice
        });
      } else if (itemType === 'package') {
        const p = db.prepare('SELECT * FROM packages WHERE id = ? AND active = 1').get(pkgId);
        if (!p) throw new Error(`Package with ID ${pkgId || item.id} is not available`);

        const qty = item.quantity || item.qty || 1;
        subtotal += p.price * qty;

        const customChoices = item.customSelections || item.customized_items || [];
        const customizedDetails = customChoices.map(cs => ({
          vegetableId: cs.id || cs.vegetable_id,
          name: cs.name || cs.name_snapshot || cs.vegetable_name,
          portion: cs.portion || cs.quantity_snapshot || '1 kg'
        }));

        validatedItems.push({
          type: 'package',
          packageId: p.id,
          name: p.name,
          unit: 'package',
          quantity: qty,
          price: p.price,
          customizedDetails
        });
      }
    }

    const total = Math.max(0, subtotal + deliveryCharge - discount);
    const initialTracking = JSON.stringify([{
      status: 'New',
      note: 'Order placed successfully and waiting for store confirmation',
      time: new Date().toISOString()
    }]);

    const orderRes = db.prepare(`
      INSERT INTO orders (
        customer_id, customer_name, phone, email, address, city, pin, instructions,
        subtotal, delivery_charge, discount, total, payment_method, payment_status, status, tracking_updates
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      req.user.id,
      customer.name,
      customer.phone,
      customer.email || req.user.email || '',
      customer.address,
      customer.city,
      customer.pin,
      customer.instructions || '',
      subtotal,
      deliveryCharge,
      discount,
      total,
      paymentMethod,
      paymentMethod === 'Online' ? 'Paid' : 'Pending',
      'New',
      initialTracking
    );

    const orderId = orderRes.lastInsertRowid;

    const addOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, vegetable_id, package_id, name_snapshot, quantity, unit_snapshot, price, item_type)
      VALUES (?,?,?,?,?,?,?,?)
    `);

    const addCustomChoice = db.prepare(`
      INSERT INTO customized_package_items (order_item_id, vegetable_id, name_snapshot, quantity_snapshot)
      VALUES (?,?,?,?)
    `);

    for (const item of validatedItems) {
      if (item.type === 'vegetable') {
        addOrderItem.run(orderId, item.vegetableId, null, item.name, item.quantity, item.unit, item.price, 'vegetable');
      } else {
        const itemRes = addOrderItem.run(orderId, null, item.packageId, item.name, item.quantity, 'package', item.price, 'package');
        const orderItemId = itemRes.lastInsertRowid;
        (item.customizedDetails || []).forEach(cd => {
          addCustomChoice.run(orderItemId, cd.vegetableId, cd.name, cd.portion);
        });
      }
    }

    // Add Admin Notification
    db.prepare('INSERT INTO notifications(title, message, type) VALUES(?,?,?)')
      .run(`New Order #${orderId}`, `Customer ${customer.name} placed a new order for ₹${total}`, 'info');

    return orderId;
  });

  try {
    const orderId = processOrder();
    res.json({ success: true, orderId, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function getCustomerOrders(req, res) {
  const orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC').all(req.user.id);
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

export function getOrderById(req, res) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const getItems = db.prepare(`
    SELECT oi.*, COALESCE(v.image, p.image, '') as image 
    FROM order_items oi 
    LEFT JOIN vegetables v ON v.id = oi.vegetable_id 
    LEFT JOIN packages p ON p.id = oi.package_id 
    WHERE oi.order_id = ?
  `);
  const getChoices = db.prepare('SELECT * FROM customized_package_items WHERE order_item_id = ?');

  const items = getItems.all(order.id).map(item => {
    if (item.item_type === 'package') {
      return {
        ...item,
        customized_items: getChoices.all(item.id)
      };
    }
    return item;
  });

  res.json({
    ...order,
    tracking_updates: JSON.parse(order.tracking_updates || '[]'),
    items
  });
}
