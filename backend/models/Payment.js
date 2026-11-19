const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['UPI', 'Card', 'Net Banking', 'Cash'], required: true },
  couponCode: { type: String },
  discount: { type: Number, default: 0 },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  transactionRef: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
