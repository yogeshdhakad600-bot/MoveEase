const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Tracking = require('../models/Tracking');
const calculateQuote = require('../utils/calculateQuote');
const generateBookingId = require('../utils/generateBookingId');

exports.createBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupAddress, deliveryAddress, movingDate, propertyType, floors, hasLift, services, distanceKm } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const { breakdown, total } = calculateQuote({ vehicle, distanceKm, floors, hasLift, services });

    const booking = await Booking.create({
      bookingId: generateBookingId(),
      customer: req.user._id,
      vehicle: vehicle._id,
      requestedVehicle: vehicle._id,
      pickupAddress, deliveryAddress, movingDate, propertyType,
      floors, hasLift, services, distanceKm,
      quoteBreakdown: breakdown,
      estimatedCost: total,
      statusHistory: [{ status: 'Booking Confirmed', note: 'Booking created' }],
    });
    await Tracking.create({ booking: booking._id, status: 'Booking Confirmed', updatedBy: req.user._id });
    res.status(201).json(booking);
  } catch (err) { next(err); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id }).populate('vehicle driver', '-password').sort('-createdAt');
    res.json(bookings);
  } catch (err) { next(err); }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId }).populate('vehicle driver customer', '-password');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role === 'customer' && String(booking.customer._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(booking);
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.customer) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    if (['In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Bookings cannot be cancelled once they are in transit' });
    }
    booking.status = 'Cancelled';
    booking.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer' });
    await booking.save();
    res.json(booking);
  } catch (err) { next(err); }
};
