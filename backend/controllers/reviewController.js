const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId) return res.status(400).json({ message: 'Booking ID is required' });
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'Delivered') return res.status(400).json({ message: 'Feedback can only be submitted after delivery' });
    if (req.user.role === 'customer' && String(booking.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only review your own booking' });
    }
    if (req.user.role === 'driver' && String(booking.driver) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only review a booking assigned to you' });
    }

    const existingReview = await Review.findOne({
      booking: booking._id,
      $or: [
        { author: req.user._id },
        { customer: req.user._id, author: { $exists: false } },
      ],
    });
    if (existingReview) return res.status(409).json({ message: 'You already submitted feedback for this booking' });

    const review = await Review.create({
      booking: booking._id,
      customer: booking.customer,
      author: req.user._id,
      authorRole: req.user.role,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (err) { next(err); }
};

exports.listReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      $or: [{ authorRole: 'customer' }, { authorRole: { $exists: false } }],
    }).populate('author', 'name').populate('customer', 'name').sort('-createdAt').limit(20);
    res.json(reviews);
  } catch (err) { next(err); }
};

exports.listMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      $or: [
        { author: req.user._id },
        { customer: req.user._id, author: { $exists: false } },
      ],
    }).populate('booking', 'bookingId');
    res.json(reviews);
  } catch (err) { next(err); }
};

exports.listAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('author', 'name role')
      .populate('customer', 'name')
      .populate('booking', 'bookingId')
      .sort('-createdAt')
      .limit(100);
    res.json(reviews);
  } catch (err) { next(err); }
};
