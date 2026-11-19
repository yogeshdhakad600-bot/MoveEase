require('dotenv').config();
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');

(async () => {
  if (!await connectDB()) process.exit(1);
  const exists = await User.findOne({ email: 'admin@moveease.com' });
  if (!exists) {
    await User.create({ name: 'MoveEase Admin', email: 'admin@moveease.com', phone: '9999999999', password: 'admin123', role: 'admin' });
    console.log('Admin created -> admin@moveease.com / admin123');
  } else console.log('Admin already exists');
  await closeDB();
})();
