require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MONGODB_URI, PORT } = require('./src/config');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * AUTH & USERS
 */
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));

/**
 * MASTER DATA
 */
app.use('/api/units', require('./src/routes/units'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/product-units', require('./src/routes/productUnits'));
app.use('/api/opening-stock', require('./src/routes/openingStock'));

/**
 * REPORTS & DASHBOARD
 */
app.use('/api/reports', require('./src/routes/reports'));

app.get('/api/health', (req, res) =>
  res.json({ ok: true, name: 'DMS Server', time: new Date() })
);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () =>
      console.log(`DMS Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('DB connect error', err);
    process.exit(1);
  });
