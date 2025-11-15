module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/dms',
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'change_me',
  COMPANY_FIXED_COSTS: Number(process.env.COMPANY_FIXED_COSTS || 0),
  APP_URL: process.env.APP_URL || 'http://localhost:3000'
};