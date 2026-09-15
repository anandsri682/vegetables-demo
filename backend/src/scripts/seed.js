import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Vegetable from '../models/Vegetable.js';
import Package from '../models/Package.js';
import Branch from '../models/Branch.js';
import StoreSetting from '../models/StoreSetting.js';

dotenv.config();

export async function seedDatabase() {
  await connectDB();

  console.log('🌱 Starting MongoDB database seed process...');

  // 1. Seed Admin Account
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const password_hash = bcrypt.hashSync('Admin@123', 10);
    await User.create({
      name: 'Store Admin',
      email: 'admin@jamalpurs.local',
      password_hash,
      role: 'admin',
      phone: '9876543210',
      address: '123 Market Road',
      city: 'Freshville',
      pin: '500001'
    });
    console.log('✅ Admin user created: admin@jamalpurs.local / Admin@123');
  }

  // 2. Seed Categories
  const categoryNames = [
    'Leafy Vegetables',
    'Root Vegetables',
    'Fruit Vegetables',
    'Common Vegetables',
    'Exotic & Other'
  ];
  const catDocs = {};
  for (const name of categoryNames) {
    let cat = await Category.findOne({ name });
    if (!cat) {
      cat = await Category.create({ name });
    }
    catDocs[name] = cat;
  }
  console.log('✅ Categories seeded');

  // 3. Seed Vegetables
  const vegCount = await Vegetable.countDocuments();
  if (vegCount === 0) {
    const sampleVegs = [
      { name: 'Spinach (Palak)', category_id: catDocs['Leafy Vegetables']._id, category_name: 'Leafy Vegetables', price: 30, unit: 'bunch', stock: 50, availability: 'Available', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80', description: 'Fresh organic green spinach bunches.' },
      { name: 'Fresh Carrot', category_id: catDocs['Root Vegetables']._id, category_name: 'Root Vegetables', price: 45, unit: 'kg', stock: 60, availability: 'Available', image: 'https://images.unsplash.com/photo-1598170845058-12ef4a45753b?auto=format&fit=crop&w=500&q=80', description: 'Sweet crunchy farm red carrots.' },
      { name: 'Broccoli Organic', category_id: catDocs['Exotic & Other']._id, category_name: 'Exotic & Other', price: 90, unit: 'kg', stock: 30, availability: 'Available', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=500&q=80', description: 'High nutrition fresh green broccoli florets.' },
      { name: 'Ripe Red Tomato', category_id: catDocs['Fruit Vegetables']._id, category_name: 'Fruit Vegetables', price: 35, unit: 'kg', stock: 100, availability: 'Available', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80', description: 'Juicy country tomatoes.' },
      { name: 'Farm Potato', category_id: catDocs['Common Vegetables']._id, category_name: 'Common Vegetables', price: 30, unit: 'kg', stock: 120, availability: 'Available', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80', description: 'Fresh yellow potatoes.' },
      { name: 'Red Onion', category_id: catDocs['Common Vegetables']._id, category_name: 'Common Vegetables', price: 40, unit: 'kg', stock: 90, availability: 'Available', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80', description: 'Grade-A Indian red onions.' },
      { name: 'Amaranth', category_id: catDocs['Leafy Vegetables']._id, category_name: 'Leafy Vegetables', price: 50, unit: 'bunch', stock: 40, availability: 'Available', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80', description: 'Fresh green amaranth leaves.' },
      { name: 'Crispy Cucumber', category_id: catDocs['Fruit Vegetables']._id, category_name: 'Fruit Vegetables', price: 30, unit: 'kg', stock: 50, availability: 'Available', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=500&q=80', description: 'Hydrating fresh salad cucumbers.' }
    ];
    await Vegetable.insertMany(sampleVegs);
    console.log('✅ Vegetables seeded');
  }

  // 4. Seed Packages
  const pkgCount = await Package.countDocuments();
  if (pkgCount === 0) {
    const allVegs = await Vegetable.find().limit(4);
    const vegIds = allVegs.map(v => v._id);
    await Package.create([
      {
        name: 'Weekly Family Combo',
        price: 349,
        total_items: 5,
        default_items: 2,
        description: 'Curated 5-item vegetable combo with 2 fixed essentials and 3 customizable choices.',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        active: true,
        default_vegetable_ids: vegIds.slice(0, 2),
        customizable_vegetable_ids: vegIds.slice(2, 4)
      },
      {
        name: 'Organic Green Basket',
        price: 299,
        total_items: 4,
        default_items: 2,
        description: 'Leafy green vegetables and salad produce for healthy daily cooking.',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
        active: true,
        default_vegetable_ids: vegIds.slice(0, 2),
        customizable_vegetable_ids: vegIds.slice(2, 4)
      }
    ]);
    console.log('✅ Packages seeded');
  }

  // 5. Seed Branches
  const branchCount = await Branch.countDocuments();
  if (branchCount === 0) {
    await Branch.create({
      name: "Jamalpur's Central Warehouse",
      location: '123 Market Road, Freshville',
      phone: '+91 98765 43210',
      status: 'Active'
    });
    console.log('✅ Branch seeded');
  }

  // 6. Seed Store Settings
  const settings = [
    { key: 'store_name', value: "Jamalpur's Market" },
    { key: 'support_email', value: 'support@jamalpurs.local' },
    { key: 'contact_number', value: '+91 98765 43210' },
    { key: 'delivery_radius', value: '15 km' }
  ];
  for (const s of settings) {
    await StoreSetting.updateOne({ key: s.key }, { key: s.key, value: s.value }, { upsert: true });
  }
  console.log('✅ Store Settings seeded');

  console.log('🎉 Seeding completed successfully!');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
