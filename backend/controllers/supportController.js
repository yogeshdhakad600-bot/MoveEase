const SupportTicket = require('../models/SupportTicket');
const Booking = require('../models/Booking');

exports.createTicket = async (req, res, next) => {
  try {
    const { bookingId, subject, message } = req.body;
    let booking;
    if (bookingId) {
      const ownerField = req.user.role === 'driver' ? 'driver' : 'customer';
      booking = await Booking.findOne({ bookingId, [ownerField]: req.user._id });
      if (!booking) return res.status(404).json({ message: 'Booking not found for this account' });
    }
    const ticket = await SupportTicket.create({
      customer: req.user.role === 'customer' ? req.user._id : undefined,
      requester: req.user._id,
      requesterRole: req.user.role,
      booking: booking?._id,
      subject,
      message,
    });
    res.status(201).json(ticket);
  } catch (err) { next(err); }
};
exports.myTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({
      $or: [
        { requester: req.user._id },
        { customer: req.user._id, requester: { $exists: false } },
      ],
    }).populate('requester', 'name').populate('booking', 'bookingId').sort('-createdAt');
    res.json(tickets);
  } catch (err) { next(err); }
};

exports.allTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('requester', 'name email role')
      .populate('customer', 'name email')
      .populate('booking', 'bookingId')
      .sort('-createdAt');
    res.json(tickets);
  } catch (err) { next(err); }
};

exports.respondTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const status = req.body.status || 'resolved';
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid support ticket status' });
    }
    if (req.body.reply !== undefined) ticket.reply = req.body.reply;
    ticket.status = status;
    await ticket.save();
    res.json(ticket);
  } catch (err) { next(err); }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (req.user.role !== 'admin') {
      const ownerId = ticket.requester || ticket.customer;
      if (!ownerId || String(ownerId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'You can only delete your own ticket' });
      }
    }

    await ticket.deleteOne();
    res.json({ message: 'Support ticket deleted' });
  } catch (err) { next(err); }
};
