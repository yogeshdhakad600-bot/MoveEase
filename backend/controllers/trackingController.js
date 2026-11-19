const Booking = require('../models/Booking');
const Tracking = require('../models/Tracking');

exports.trackByBookingId = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId }).populate('vehicle driver', '-password');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const history = await Tracking.find({ booking: booking._id }).sort('timestamp');
    res.json({ booking, history, statusFlow: Booking.STATUS_FLOW });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, location, note } = req.body;
    if (!Booking.STATUS_FLOW.includes(status)) return res.status(400).json({ message: 'Invalid shipment status' });
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role === 'driver' && String(booking.driver) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your assigned booking' });
    }
    booking.status = status;
    booking.statusHistory.push({ status, note });
    await booking.save();
    await Tracking.create({ booking: booking._id, status, location, updatedBy: req.user._id });
    res.json(booking);
  } catch (err) { next(err); }
};
