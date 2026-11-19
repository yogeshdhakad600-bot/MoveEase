const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createBooking, getMyBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');

router.use(protect);
router.post('/', authorize('customer'), createBooking);
router.get('/mine', authorize('customer'), getMyBookings);
router.get('/:bookingId', getBookingById);
router.patch('/:bookingId/cancel', authorize('customer'), cancelBooking);

module.exports = router;
