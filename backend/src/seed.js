// import 'dotenv/config'; // must stay the first import
// import mongoose from 'mongoose';
// import { connectDB } from './config/db.js';
// import User from './models/User.js';
// import Category from './models/Category.js';
// import Product from './models/Product.js';

// const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

// const run = async () => {
//   await connectDB();

//   // 1) Admin account (the only way to get an admin: signup always creates a "user")
//   const adminName = process.env.ADMIN_NAME || 'Admin';
//   const adminEmail = process.env.ADMIN_EMAIL || 'admin@shop.com';
//   const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

//   let admin = await User.findOne({ email: adminEmail });
//   if (!admin) {
//     admin = await User.create({
//       name: adminName,
//       email: adminEmail,
//       password: adminPassword,
//       role: 'admin',
//       isVerified: true,
//     });
//     console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
//   } else {
//     console.log('Admin already exists');
//   }

//   // 2) Sample catalogue (only when the database has no products)
//   if ((await Product.countDocuments()) === 0) {
//     const categories = await Category.create([
//       { name: 'Electronics', description: 'Gadgets and accessories' },
//       { name: 'Fashion', description: 'Clothing and footwear' },
//       { name: 'Home & Kitchen', description: 'Everything for your home' },
//     ]);
//     const [electronics, fashion, home] = categories;

//     await Product.create([
//       { name: 'Wireless Headphones', description: 'Over-ear, 30h battery, noise isolation.', price: 2499, stock: 25, image: img('headphones'), category: electronics._id },
//       { name: 'Smart Watch', description: 'Heart-rate tracking, 7-day battery.', price: 3999, stock: 15, image: img('watch'), category: electronics._id },
//       { name: 'Bluetooth Speaker', description: 'Portable, waterproof, deep bass.', price: 1799, stock: 30, image: img('speaker'), category: electronics._id },
//       { name: 'Running Shoes', description: 'Lightweight and breathable.', price: 2199, stock: 40, image: img('shoes'), category: fashion._id },
//       { name: 'Denim Jacket', description: 'Classic fit, 100% cotton.', price: 1599, stock: 20, image: img('jacket'), category: fashion._id },
//       { name: 'Ceramic Coffee Mug', description: 'Set of 2, microwave safe.', price: 399, stock: 100, image: img('mug'), category: home._id },
//       { name: 'Non-stick Frying Pan', description: '26cm, induction compatible.', price: 899, stock: 50, image: img('pan'), category: home._id },
//     ]);
//     console.log('Sample categories and products created');
//   }

//   await mongoose.disconnect();
// };

// run().catch(async (err) => {
//   console.error(err);
//   await mongoose.disconnect();
//   process.exit(1);
// });


import 'dotenv/config'; // must stay the first import
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Otp from './models/Otp.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';

// ---------------------------------------------------------------------------
// WARNING: running this script DELETES EVERYTHING in the database
// (users, categories, products, carts, orders, OTPs) and then creates:
//   - one admin account (from .env)
//   - electronics categories and products
// ---------------------------------------------------------------------------

const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const CATEGORIES = [
  { name: 'Smartphones', description: 'Phones for every budget' },
  { name: 'Laptops', description: 'Laptops for work, study and play' },
  { name: 'Audio', description: 'Headphones, earbuds and speakers' },
  { name: 'Wearables', description: 'Smartwatches and fitness bands' },
  { name: 'Cameras', description: 'Cameras and action cams' },
  { name: 'Gaming', description: 'Consoles, controllers and gaming gear' },
  { name: 'Accessories', description: 'Chargers, cables and power banks' },
];

// [category, name, description, price (INR), stock]
const PRODUCTS = [
  ['Smartphones', '5G Smartphone 8GB/128GB', '6.7" AMOLED 120Hz display, 50MP camera, 5000mAh battery.', 18999, 40],
  ['Smartphones', 'Flagship Smartphone 12GB/256GB', '6.8" LTPO display, triple camera, 100W fast charging.', 64999, 18],
  ['Smartphones', 'Budget Smartphone 4GB/64GB', '6.5" HD+ display, 13MP camera, 5000mAh battery.', 8499, 60],

  ['Laptops', '14" Everyday Laptop i5 / 16GB / 512GB SSD', 'Full HD IPS display, backlit keyboard, up to 10h battery.', 52990, 20],
  ['Laptops', '15.6" Gaming Laptop Ryzen 7 / RTX 4060', '144Hz display, 16GB RAM, 1TB SSD, RGB keyboard.', 89990, 10],
  ['Laptops', '13" Ultrabook 1.2kg / 16GB / 512GB', 'Aluminium body, 2.8K display, all-day battery.', 74990, 12],

  ['Audio', 'Wireless Over-Ear Headphones', 'Active noise cancellation, 40h battery, Bluetooth 5.3.', 4999, 35],
  ['Audio', 'True Wireless Earbuds', 'Low-latency mode, IPX5 sweat resistance, 24h with case.', 1999, 80],
  ['Audio', 'Portable Bluetooth Speaker', 'Waterproof, 20W output, 12h playtime.', 2799, 45],
  ['Audio', 'Soundbar 2.1 with Wireless Subwoofer', '120W, HDMI ARC, Bluetooth and optical input.', 8999, 15],

  ['Wearables', 'AMOLED Smartwatch', 'Calling, heart-rate and SpO2 tracking, 7-day battery.', 3999, 50],
  ['Wearables', 'Fitness Band', 'Step and sleep tracking, 14-day battery, water resistant.', 1499, 70],
  ['Wearables', 'Sports GPS Watch', 'Built-in GPS, 100+ sport modes, 14-day battery.', 12999, 14],

  ['Cameras', 'Mirrorless Camera 24MP with 18-55mm Lens', '4K video, 5-axis stabilisation, Wi-Fi sharing.', 58999, 8],
  ['Cameras', '4K Action Camera', 'Waterproof to 10m, electronic stabilisation, touch screen.', 9999, 22],
  ['Cameras', 'Instant Camera Bundle', 'Prints credit-card-size photos, includes 20-shot film pack.', 6499, 16],

  ['Gaming', 'Wireless Game Controller', 'Works with PC and mobile, 30h battery, hall-effect sticks.', 3499, 40],
  ['Gaming', 'Mechanical Gaming Keyboard', 'Hot-swappable switches, RGB lighting, aluminium plate.', 4299, 30],
  ['Gaming', 'Gaming Mouse 26000 DPI', 'Lightweight 60g, 6 programmable buttons, 70h battery.', 2499, 55],

  ['Accessories', '20000mAh Power Bank 22.5W', 'Fast charging, dual USB-A and USB-C ports.', 1799, 90],
  ['Accessories', '65W GaN USB-C Charger', 'Charges a laptop and phone at the same time.', 2199, 65],
  ['Accessories', 'USB-C to USB-C Cable 1.5m (2-pack)', 'Braided, 100W power delivery, 480Mbps.', 599, 150],
];

const run = async () => {
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('Refusing to wipe a production database. Run with --force if you really mean it.');
    process.exit(1);
  }

  await connectDB();

  // 1) Wipe everything and rebuild indexes
  const models = [User, Otp, Category, Product, Cart, Order];
  await Promise.all(models.map((m) => m.deleteMany({})));
  await Promise.all(models.map((m) => m.syncIndexes()));
  console.log('Database cleared (users, categories, products, carts, orders, OTPs)');

  // 2) Admin account (signup always creates a normal "user", so this is the only admin)
  const adminName = process.env.ADMIN_NAME || 'Admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@shop.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isVerified: true,
  });
  console.log(`Admin created: ${adminEmail} / ${adminPassword}`);

  // 3) Electronics categories
  const categories = await Category.create(CATEGORIES);
  const byName = Object.fromEntries(categories.map((c) => [c.name, c._id]));
  console.log(`${categories.length} categories created`);

  // 4) Electronics products
  await Product.create(
    PRODUCTS.map(([category, name, description, price, stock]) => ({
      name,
      description,
      price,
      stock,
      category: byName[category],
      image: img(name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      createdBy: admin._id,
    }))
  );
  console.log(`${PRODUCTS.length} products created`);

  await mongoose.disconnect();
  console.log('Done.');
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});