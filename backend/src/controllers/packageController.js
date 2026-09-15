import Package from '../models/Package.js';

export async function getPackages(req, res) {
  try {
    const packages = await Package.find({ active: true })
      .populate('default_vegetable_ids')
      .populate('customizable_vegetable_ids')
      .sort({ price: 1 });

    const result = packages.map(p => {
      const obj = p.toJSON();
      return {
        ...obj,
        defaultVegetables: (p.default_vegetable_ids || []).map(v => v.toJSON ? v.toJSON() : v),
        customizableVegetables: (p.customizable_vegetable_ids || []).map(v => v.toJSON ? v.toJSON() : v)
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPackageById(req, res) {
  try {
    const p = await Package.findOne({ _id: req.params.id, active: true })
      .populate('default_vegetable_ids')
      .populate('customizable_vegetable_ids');

    if (!p) return res.status(404).json({ error: 'Package not found' });

    const obj = p.toJSON();
    res.json({
      ...obj,
      defaultVegetables: (p.default_vegetable_ids || []).map(v => v.toJSON ? v.toJSON() : v),
      customizableVegetables: (p.customizable_vegetable_ids || []).map(v => v.toJSON ? v.toJSON() : v)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

