import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserAddress from '../models/UserAddress.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export async function register(req, res) {
  try {
    const { name, email, password, phone, address, city, pin } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Account with this email already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const userDoc = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash: hash,
      role: 'customer',
      phone: phone || '',
      address: address || '',
      city: city || 'Hyderabad',
      pin: pin || ''
    });

    const user = userDoc.toJSON();
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id || req.user._id).select('-password_hash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, address, city, pin } = req.body;
    const userId = req.user.id || req.user._id;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { name, phone, address, city, pin } },
      { new: true }
    ).select('-password_hash');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAddresses(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const rows = await UserAddress.find({ user_id: userId }).sort({ is_default: -1, _id: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addAddress(req, res) {
  try {
    const { tag = 'Home', name, phone, address, city, pin, is_default } = req.body;
    if (!address || !city || !pin) {
      return res.status(400).json({ error: 'Address, city, and pincode are required.' });
    }

    const userId = req.user.id || req.user._id;

    if (is_default) {
      await UserAddress.updateMany({ user_id: userId }, { is_default: false });
    }

    const newAddress = await UserAddress.create({
      user_id: userId,
      tag,
      name: name || '',
      phone: phone || '',
      address,
      city,
      pin,
      is_default: Boolean(is_default)
    });

    res.json(newAddress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAddress(req, res) {
  try {
    const { tag, name, phone, address, city, pin, is_default } = req.body;
    const userId = req.user.id || req.user._id;

    const target = await UserAddress.findOne({ _id: req.params.id, user_id: userId });
    if (!target) return res.status(404).json({ error: 'Address record not found.' });

    if (is_default) {
      await UserAddress.updateMany({ user_id: userId }, { is_default: false });
    }

    if (tag !== undefined) target.tag = tag;
    if (name !== undefined) target.name = name;
    if (phone !== undefined) target.phone = phone;
    if (address !== undefined) target.address = address;
    if (city !== undefined) target.city = city;
    if (pin !== undefined) target.pin = pin;
    if (is_default !== undefined) target.is_default = Boolean(is_default);

    await target.save();
    res.json(target);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAddress(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const target = await UserAddress.findOne({ _id: req.params.id, user_id: userId });
    if (!target) return res.status(404).json({ error: 'Address record not found.' });

    await UserAddress.deleteOne({ _id: req.params.id, user_id: userId });

    if (target.is_default) {
      const nextAddr = await UserAddress.findOne({ user_id: userId }).sort({ _id: -1 });
      if (nextAddr) {
        nextAddr.is_default = true;
        await nextAddr.save();
      }
    }

    res.json({ success: true, message: 'Address removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function setDefaultAddress(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const target = await UserAddress.findOne({ _id: req.params.id, user_id: userId });
    if (!target) return res.status(404).json({ error: 'Address record not found.' });

    await UserAddress.updateMany({ user_id: userId }, { is_default: false });
    target.is_default = true;
    await target.save();

    res.json({ success: true, message: 'Default delivery address updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password confirmation is required to delete account.' });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect password. Account deletion aborted.' });
    }

    await User.findByIdAndDelete(userId);
    await UserAddress.deleteMany({ user_id: userId });

    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

