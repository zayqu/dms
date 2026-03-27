const mongoose = require('mongoose');
const Location = require('../models/Location');

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/dms');

  let location = await Location.findOne({ name: 'Main Shop' });

  if (!location) {
    location = await Location.create({
      name: 'Main Shop',
      type: 'shop',
      address: 'Default location'
    });

    console.log('Location created:', location._id);
  } else {
    console.log('Location already exists:', location._id);
  }

  process.exit();
})();