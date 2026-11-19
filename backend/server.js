require('dotenv').config();
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production.');
  }
  process.env.JWT_SECRET = 'moveease_lab_secret_change_me';
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB, closeDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const supportRoutes = require('./routes/supportRoutes');
const mapsRoutes = require('./routes/mapsRoutes');

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({ origin: allowedOrigins.includes('*') ? true : allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MoveEase API', version: '2.0.0' }));
app.use('/api/auth', authRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/maps', mapsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function seedDefaults() {
  const User = require('./models/User');
  const Vehicle = require('./models/Vehicle');

  const admin = await User.findOne({ email: 'admin@moveease.com' });
  if (!admin) {
    await User.create({
      name: 'MoveEase Admin',
      email: 'admin@moveease.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Demo admin created: admin@moveease.com / admin123');
  }

  const driver = await User.findOne({ email: 'driver@moveease.com' });
  if (!driver) {
    await User.create({
      name: 'Demo Driver',
      email: 'driver@moveease.com',
      phone: '9888888888',
      password: 'driver123',
      role: 'driver',
      licenseNumber: 'RJ14-DRV-2026',
    });
    console.log('Demo driver created: driver@moveease.com / driver123');
  }

  const vehicleCount = await Vehicle.countDocuments();
  if (!vehicleCount) {
    await Vehicle.insertMany([
      { type: 'Mini Truck', baseFare: 3500, perKmRate: 18, capacityTons: 0.75 },
      { type: 'Tata 407', baseFare: 5500, perKmRate: 25, capacityTons: 2.5 },
      { type: '14 Ft Truck', baseFare: 8500, perKmRate: 35, capacityTons: 5 },
      { type: '17 Ft Truck', baseFare: 11000, perKmRate: 42, capacityTons: 7 },
      { type: '20 Ft Truck', baseFare: 13500, perKmRate: 48, capacityTons: 9 },
    ]);
    console.log('Demo vehicles created.');
  }

}

async function startServer() {
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.error('MoveEase could not start. Database initialization failed.');
    process.exit(1);
  }

  await seedDefaults();

  const server = app.listen(PORT, () => {
    console.log(`MoveEase API running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log('\nShutting down MoveEase...');
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
