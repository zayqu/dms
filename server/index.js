require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MONGODB_URI, PORT } = require('./src/config');

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/transactions', require('./src/routes/transactions'));
app.use('/api/expenses', require('./src/routes/expenses'));
app.use('/api/reports', require('./src/routes/reports'));
// after other routes registration
app.use('/api/pending', require('./src/routes/pending'));


app.get('/api/health', (req, res) => res.json({ ok: true, name: 'DMS Server', time: new Date() }));

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => { console.error('DB connect error', err); process.exit(1); });