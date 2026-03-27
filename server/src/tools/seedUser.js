const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/dms');

  const exists = await User.findOne({ email: 'admin@admin.com' });

  if (!exists) {
    await User.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: '123456',
      phone: '0000000000',
      role: 'admin'
    });

    console.log('Admin created');
  } else {
    console.log('Already exists');
  }

  process.exit();
})();