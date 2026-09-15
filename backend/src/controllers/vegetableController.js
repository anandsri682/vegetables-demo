import Vegetable from '../models/Vegetable.js';
import Category from '../models/Category.js';
import Branch from '../models/Branch.js';
import StoreSetting from '../models/StoreSetting.js';

export async function getVegetables(req, res) {
  try {
    const vegs = await Vegetable.find().populate('category_id', 'name').sort({ name: 1 });
    const formatted = vegs.map(v => {
      const obj = v.toJSON();
      obj.category_name = v.category_id?.name || obj.category_name || '';
      return obj;
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBranches(req, res) {
  try {
    const branches = await Branch.find({ status: 'Active' }).sort({ _id: 1 });
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSettings(req, res) {
  try {
    const settings = await StoreSetting.find();
    const obj = Object.fromEntries(settings.map(s => [s.key, s.value]));
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

