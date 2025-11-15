require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MONGODB_URI } = require('../config');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Seeding DB');

  await Tenant.deleteMany({});
  await User.deleteMany({});
  await Product.deleteMany({});
  await Transaction.deleteMany({});
  await Expense.deleteMany({});

  const tenant = new Tenant({ name: 'DMS Demo', plan: 'trial' });
  await tenant.save();

  const pass = 'Daraja123!';
  const hash = await bcrypt.hash(pass, 10);
  const owner = new User({ name: 'Owner Demo', email: 'owner@dms.local', passwordHash: hash, role: 'owner', tenantId: tenant._id });
  await owner.save();
  console.log('Owner:', owner.email, pass);

  const products = [
    { tenantId: tenant._id, name: 'Bottled Water 500ml', sku: 'BW500', unit: 'Piece', unitsPerBase:1, buyPrice: 400, sellPrice:700, stock:1000 },
    { tenantId: tenant._id, name: 'Soda Can 330ml', sku: 'SC330', unit: 'Piece', unitsPerBase:1, buyPrice:600, sellPrice:1000, stock:700 },
    { tenantId: tenant._id, name: 'Beer Crate 24x330ml', sku: 'BC24', unit: 'Crate', unitsPerBase:24, buyPrice: 9000, sellPrice:12000, stock:200 }
  ];
  await Product.insertMany(products);
  console.log('Seeded products');

  // sample expense
  await Expense.create({ tenantId: tenant._id, description: 'Fuel', amount: 12000, category: 'operational', createdBy: owner._id });
  console.log('Seed complete');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err=>{ console.error(err); process.exit(1); });