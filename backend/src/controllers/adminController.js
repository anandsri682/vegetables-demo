import Order from '../models/Order.js';
import Vegetable from '../models/Vegetable.js';
import Package from '../models/Package.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import StoreSetting from '../models/StoreSetting.js';
import Notification from '../models/Notification.js';

export async function getStats(req, res) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const revAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revAgg[0]?.total || 0;

    const todayRevAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const todayRevenue = todayRevAgg[0]?.total || 0;

    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const pendingOrders = await Order.countDocuments({ status: { $in: ['New', 'Confirmed', 'Preparing'] } });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

    const totalVegetables = await Vegetable.countDocuments();
    const activeProducts = await Vegetable.countDocuments({ availability: 'Available', stock: { $gt: 0 } });
    const outOfStockProducts = await Vegetable.countDocuments({
      $or: [{ availability: 'Out of Stock' }, { stock: { $lte: 0 } }]
    });
    const unavailableProducts = await Vegetable.countDocuments({ availability: 'Temporarily Unavailable' });
    const totalPackages = await Package.countDocuments({ active: true });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalBranches = await Branch.countDocuments();

    const topSelling = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.item_type': 'vegetable' } },
      {
        $group: {
          _id: '$items.name_snapshot',
          name: { $first: '$items.name_snapshot' },
          total_qty: { $sum: '$items.quantity' },
          total_sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { total_qty: -1 } },
      { $limit: 5 }
    ]);

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAdminOrders(req, res) {
  try {
    const orders = await Order.find().sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const newStatus = status || order.status;
    const newNote = note || `Order status updated to ${newStatus}`;

    order.status = newStatus;
    order.tracking_updates.push({
      status: newStatus,
      note: newNote,
      time: new Date().toISOString()
    });

    await order.save();

    res.json({ success: true, message: `Order status updated to ${newStatus}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createVegetable(req, res) {
  try {
    const { name, category_id, description, price, unit = 'kg', stock = 50, availability = 'Available', featured = 0, discount = 0, image } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: 'Vegetable name and price are required' });
    if (!image || !image.trim()) return res.status(400).json({ error: 'Product image is mandatory. Please upload an image file or provide an image URL.' });

    const newVeg = await Vegetable.create({
      name,
      category_id: category_id || null,
      description: description || '',
      price,
      unit,
      stock,
      availability,
      featured: Boolean(featured),
      discount: discount || 0,
      image: image.trim()
    });

    res.json({ success: true, id: newVeg.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateVegetable(req, res) {
  try {
    const { name, category_id, description, price, unit, stock, availability, featured, discount, image } = req.body;
    const v = await Vegetable.findById(req.params.id);
    if (!v) return res.status(404).json({ error: 'Vegetable not found' });

    if (image !== undefined && (!image || !image.trim())) {
      return res.status(400).json({ error: 'Product image cannot be empty. Please upload an image file or URL.' });
    }

    if (name !== undefined) v.name = name;
    if (category_id !== undefined) v.category_id = category_id;
    if (description !== undefined) v.description = description;
    if (price !== undefined) v.price = price;
    if (unit !== undefined) v.unit = unit;
    if (stock !== undefined) v.stock = stock;
    if (availability !== undefined) v.availability = availability;
    if (featured !== undefined) v.featured = Boolean(featured);
    if (discount !== undefined) v.discount = discount;
    if (image !== undefined) v.image = image.trim();

    await v.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteVegetable(req, res) {
  try {
    await Vegetable.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAdminPackages(req, res) {
  try {
    const packages = await Package.find().sort({ _id: -1 });
    const full = packages.map(p => {
      const obj = p.toJSON();
      return {
        ...obj,
        default_items: (p.default_vegetable_ids || []).map(id => id.toString()),
        customizable_items: (p.customizable_vegetable_ids || []).map(id => id.toString())
      };
    });
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createPackage(req, res) {
  try {
    const { name, price, total_items = 5, default_items = 2, description, image, active = 1, default_vegetable_ids = [], customizable_vegetable_ids = [] } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Package name and price are required' });

    const pkg = await Package.create({
      name,
      price,
      total_items,
      default_items,
      description: description || '',
      image: image || '',
      active: Boolean(active),
      default_vegetable_ids,
      customizable_vegetable_ids
    });

    res.json({ success: true, id: pkg.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updatePackage(req, res) {
  try {
    const { name, price, total_items, default_items, description, image, active, default_vegetable_ids, customizable_vegetable_ids } = req.body;
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    if (name !== undefined) pkg.name = name;
    if (price !== undefined) pkg.price = price;
    if (total_items !== undefined) pkg.total_items = total_items;
    if (default_items !== undefined) pkg.default_items = default_items;
    if (description !== undefined) pkg.description = description;
    if (image !== undefined) pkg.image = image;
    if (active !== undefined) pkg.active = Boolean(active);
    if (Array.isArray(default_vegetable_ids)) pkg.default_vegetable_ids = default_vegetable_ids;
    if (Array.isArray(customizable_vegetable_ids)) pkg.customizable_vegetable_ids = customizable_vegetable_ids;

    await pkg.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deletePackage(req, res) {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAdminBranches(req, res) {
  try {
    const branches = await Branch.find().sort({ _id: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createBranch(req, res) {
  try {
    const { name, location, phone, status = 'Active' } = req.body;
    if (!name || !location) return res.status(400).json({ error: 'Branch name and location are required' });

    const branch = await Branch.create({
      name,
      location,
      phone: phone || '',
      status
    });

    res.json({ success: true, id: branch.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteBranch(req, res) {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAdminSettings(req, res) {
  try {
    const settings = await StoreSetting.find();
    res.json(Object.fromEntries(settings.map(x => [x.key, x.value])));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveAdminSettings(req, res) {
  try {
    for (const [k, v] of Object.entries(req.body)) {
      await StoreSetting.updateOne({ key: k }, { key: k, value: String(v) }, { upsert: true });
    }
    res.json({ success: true, message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAdminNotifications(req, res) {
  try {
    const notifications = await Notification.find().sort({ _id: -1 }).limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAdminCustomers(req, res) {
  try {
    const users = await User.find({ role: 'customer' }).select('-password_hash').sort({ _id: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

