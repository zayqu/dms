const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Product = require('../models/Product');
const Expense = require('../models/Expense');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  await Tenant.deleteMany();
  await User.deleteMany();
  await Product.deleteMany();
  await Expense.deleteMany();

  const tenant = await Tenant.create({ name: 'DMS Demo', plan: 'trial' });

  const hash = await bcrypt.hash('Daraja123!', 10);
  const owner = await User.create({
    name: 'Owner Demo',
    email: 'owner@dms.local',
    passwordHash: hash,
    role: 'owner',
    tenantId: tenant._id
  });

  await Product.insertMany([
    { tenantId: tenant._id, name: 'Water 500ml', buyPrice: 400, sellPrice: 700 },
    { tenantId: tenant._id, name: 'Soda 330ml', buyPrice: 600, sellPrice: 1000 }
  ]);

  await Expense.create({
    tenantId: tenant._id,
    description: 'Fuel',
    amount: 12000,
    createdBy: owner._id
  });

  console.log('Seed done');
  process.exit();
}

seed();
