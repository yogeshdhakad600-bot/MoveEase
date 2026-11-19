const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterRole: { type: String, enum: ['customer', 'driver'], required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  reply: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
