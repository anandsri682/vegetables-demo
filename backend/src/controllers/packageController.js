import { db } from '../config/db.js';

export function getPackages(req, res) {
  const packages = db.prepare('SELECT * FROM packages WHERE active = 1 ORDER BY price ASC').all();
  const getDefaultVegs = db.prepare(`
    SELECT v.* FROM vegetables v 
    JOIN package_default_items pdi ON pdi.vegetable_id = v.id 
    WHERE pdi.package_id = ?
  `);
  const getCustomVegs = db.prepare(`
    SELECT v.* FROM vegetables v 
    JOIN package_customizable_items pci ON pci.vegetable_id = v.id 
    WHERE pci.package_id = ?
  `);

  const result = packages.map(p => ({
    ...p,
    defaultVegetables: getDefaultVegs.all(p.id),
    customizableVegetables: getCustomVegs.all(p.id)
  }));

  res.json(result);
}

export function getPackageById(req, res) {
  const p = db.prepare('SELECT * FROM packages WHERE id = ? AND active = 1').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Package not found' });

  const defaultVegetables = db.prepare(`
    SELECT v.* FROM vegetables v 
    JOIN package_default_items pdi ON pdi.vegetable_id = v.id 
    WHERE pdi.package_id = ?
  `).all(p.id);

  const customizableVegetables = db.prepare(`
    SELECT v.* FROM vegetables v 
    JOIN package_customizable_items pci ON pci.vegetable_id = v.id 
    WHERE pci.package_id = ?
  `).all(p.id);

  res.json({
    ...p,
    defaultVegetables,
    customizableVegetables
  });
}
