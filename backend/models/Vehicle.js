const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  type: { type: String, enum: ['Mini Truck', 'Tata 407', '14 Ft Truck', '17 Ft Truck', '20 Ft Truck'], required: true },
  registrationNumber: { type: String, unique: true, sparse: true },
  baseFare: { type: Number, required: true },
  perKmRate: { type: Number, required: true },
  capacityTons: { type: Number },
  status: { type: String, enum: ['available', 'assigned', 'maintenance'], default: 'available' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
