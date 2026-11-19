const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

const COUPONS = { MOVE10: 0.10, FIRST50: 0.50 };

exports.pay = async (req, res, next) => {
  try {
    const { bookingId, method, couponCode } = req.body;
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.customer) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });

    const discountPct = COUPONS[String(couponCode || '').toUpperCase()] || 0;
    const discount = Math.round(booking.estimatedCost * discountPct);
    const amount = booking.estimatedCost - discount;
    const transactionRef = 'TXN' + Date.now();

    const payment = await Payment.create({
      booking: booking._id, customer: req.user._id, amount, method,
      couponCode: couponCode || undefined, discount, transactionRef,
    });
    res.status(201).json({ payment, receipt: { bookingId: booking.bookingId, amount, method, transactionRef } });
  } catch (err) { next(err); }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ customer: req.user._id }).populate('booking').sort('-createdAt');
    res.json(payments);
  } catch (err) { next(err); }
};
