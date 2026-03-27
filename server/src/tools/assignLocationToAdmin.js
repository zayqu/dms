const mongoose = require('mongoose');
const User = require('../models/User');

const LOCATION_ID = '69c6f614c5745815f25e663a';

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/dms');

  const user = await User.findOne({ email: 'admin@admin.com' });

  if (!user) {
    console.log('User not found');
    process.exit();
  }

  user.location = LOCATION_ID;
  await user.save();

  console.log('Location assigned to admin');

  process.exit();
})();