const mongoose = require('mongoose');

// Try to load from config
let mongoURI;
try {
  const config = require('./src/config');
  mongoURI = config.mongoURI || config.dbURI || config.database || config.MONGODB_URI;
} catch (e) {
  mongoURI = null;
}

// If still not found, check .env file manually
if (!mongoURI) {
  try {
    require('dotenv').config();
    mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URI || process.env.DATABASE_URL;
  } catch (e) {
    // dotenv not installed, ignore
  }
}

// Default fallback
if (!mongoURI) {
  mongoURI = 'mongodb://localhost:27017/dms';
}

console.log('Using connection string...');

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB!\n');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name).join(', ') || 'None');
    
    // Check users collection
    const userCollection = collections.find(c => c.name === 'users');
    
    if (!userCollection) {
      console.log('\nNo "users" collection found.');
      process.exit(0);
    }
    
    // Get users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log(`\n=== Found ${users.length} user(s) ===\n`);
    
    users.forEach((u, i) => {
      console.log(`--- User ${i + 1} ---`);
      console.log('ID:', u._id);
      console.log('Email:', u.email || 'N/A');
      console.log('Username:', u.username || 'N/A');
      console.log('Name:', u.name || u.fullName || 'N/A');
      console.log('Role:', u.role || 'N/A');
      console.log('Tenant:', u.tenantId || u.tenant || 'N/A');
      console.log('Has Password:', u.password ? 'YES' : 'NO');
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('\nConnection failed:', err.message);
    console.log('\nTried to connect with:', mongoURI ? 'config/env value' : 'default localhost');
    console.log('\nPlease check your src/config.js or .env file for the correct MongoDB URI');
    process.exit(1);
  });