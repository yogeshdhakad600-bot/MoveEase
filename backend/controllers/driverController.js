const Booking = require('../models/Booking');

exports.myDeliveries = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ driver: req.user._id }).populate('customer vehicle', '-password').sort('movingDate');
    res.json(bookings);
  } catch (err) { next(err); }
};

exports.uploadProof = async (req, res, next) => {
  try {
    // In production this would accept a multipart file upload to S3/Cloudinary.
    // Here it accepts a URL string as a stand-in for the uploaded proof.
    const { deliveryProofUrl } = req.body;
    const booking = await Booking.findOne({ bookingId: req.params.bookingId, driver: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.deliveryProofUrl = deliveryProofUrl;
    await booking.save();
    res.json(booking);
  } catch (err) { next(err); }
};
