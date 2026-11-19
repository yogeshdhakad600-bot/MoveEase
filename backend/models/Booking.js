const mongoose = require('mongoose');

const STATUS_FLOW = ['Booking Confirmed', 'Packing', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  requestedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  pickupAddress: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  movingDate: { type: Date, required: true },
  propertyType: { type: String, enum: ['1BHK', '2BHK', '3BHK', 'Villa', 'Office'], required: true },
  floors: { type: Number, default: 0 },
  hasLift: { type: Boolean, default: false },
  services: {
    packing: { type: Boolean, default: false },
    loadingUnloading: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
  },
  distanceKm: { type: Number, required: true },
  quoteBreakdown: { type: Object },
  estimatedCost: { type: Number, required: true },
  status: { type: String, enum: STATUS_FLOW, default: 'Booking Confirmed' },
  statusHistory: [{ status: String, updatedAt: { type: Date, default: Date.now }, note: String }],
  deliveryProofUrl: { type: String },
}, { timestamps: true });

bookingSchema.statics.STATUS_FLOW = STATUS_FLOW;
module.exports = mongoose.model('Booking', bookingSchema);
