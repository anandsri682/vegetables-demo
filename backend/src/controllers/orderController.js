import Order from '../models/Order.js';
import Vegetable from '../models/Vegetable.js';
import Package from '../models/Package.js';
import Notification from '../models/Notification.js';

export async function createOrder(req, res) {
  try {
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

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      let vegId = item.vegetableId || item.vegetable_id;
      let pkgId = item.packageId || item.package_id;
      let itemType = item.type;

      if (!itemType) {
        if (pkgId) itemType = 'package';
        else if (vegId) itemType = 'vegetable';
        else {
          const checkPkg = await Package.findById(item.id).catch(() => null);
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
        const v = await Vegetable.findById(vegId);
        if (!v) throw new Error(`Vegetable with ID ${vegId || item.id} not found`);
        if (v.availability !== 'Available' || v.stock < (item.quantity || 1)) {
          throw new Error(`"${v.name}" is currently unavailable or out of stock`);
        }
        const effectivePrice = v.price * (1 - (v.discount || 0) / 100);
        const qty = item.quantity || item.qty || 1;
        subtotal += effectivePrice * qty;

        // Deduct stock for single vegetable orders
        await Vegetable.findByIdAndUpdate(v._id, { $inc: { stock: -qty } });

        orderItems.push({
          vegetable_id: v._id,
          name_snapshot: v.name,
          quantity: qty,
          unit_snapshot: v.unit,
          price: effectivePrice,
          item_type: 'vegetable',
          image: v.image || ''
        });
      } else if (itemType === 'package') {
        const p = await Package.findOne({ _id: pkgId, active: true });
        if (!p) throw new Error(`Package with ID ${pkgId || item.id} is not available`);

        const qty = item.quantity || item.qty || 1;
        subtotal += p.price * qty;

        const customChoices = item.customSelections || item.customized_items || [];
        const customized_items = customChoices.map(cs => ({
          vegetable_id: cs.id || cs.vegetable_id,
          name_snapshot: cs.name || cs.name_snapshot || cs.vegetable_name || 'Custom Vegetable',
          quantity_snapshot: cs.portion || cs.quantity_snapshot || '1 kg'
        }));

        orderItems.push({
          package_id: p._id,
          name_snapshot: p.name,
          quantity: qty,
          unit_snapshot: 'package',
          price: p.price,
          item_type: 'package',
          image: p.image || '',
          customized_items
        });
      }
    }

    const total = Math.max(0, subtotal + deliveryCharge - discount);
    const initialTracking = [{
      status: 'New',
      note: 'Order placed successfully and waiting for store confirmation',
      time: new Date().toISOString()
    }];

    const customerId = req.user?.id || req.user?._id;

    const newOrder = await Order.create({
      customer_id: customerId,
      customer_name: customer.name,
      phone: customer.phone,
      email: customer.email || req.user?.email || '',
      address: customer.address,
      city: customer.city,
      pin: customer.pin,
      instructions: customer.instructions || '',
      subtotal,
      delivery_charge: deliveryCharge,
      discount,
      total,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'Online' ? 'Paid' : 'Pending',
      status: 'New',
      tracking_updates: initialTracking,
      items: orderItems
    });

    const orderId = newOrder.id;

    // Add Admin Notification
    await Notification.create({
      title: `New Order #${orderId}`,
      message: `Customer ${customer.name} placed a new order for ₹${total}`,
      type: 'info'
    });

    res.json({ success: true, orderId, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getCustomerOrders(req, res) {
  try {
    const customerId = req.user.id || req.user._id;
    const orders = await Order.find({ customer_id: customerId }).sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

