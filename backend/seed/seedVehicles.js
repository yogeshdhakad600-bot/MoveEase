require('dotenv').config();
const { connectDB, closeDB } = require('../config/db');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

const vehicles = [
  { type: 'Mini Truck', baseFare: 3500, perKmRate: 18, capacityTons: 0.75 },
  { type: 'Tata 407', baseFare: 5500, perKmRate: 25, capacityTons: 2.5 },
  { type: '14 Ft Truck', baseFare: 8500, perKmRate: 35, capacityTons: 5 },
  { type: '17 Ft Truck', baseFare: 11000, perKmRate: 42, capacityTons: 7 },
  { type: '20 Ft Truck', baseFare: 13500, perKmRate: 48, capacityTons: 9 },
];

(async () => {
  if (!await connectDB()) process.exit(1);
  await Vehicle.deleteMany({});
  await Vehicle.insertMany(vehicles);
  console.log('Vehicles seeded');
  await closeDB();
})();
