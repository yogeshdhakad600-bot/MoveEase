const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { trackByBookingId, updateStatus } = require('../controllers/trackingController');

// Public read-only tracking: customers can track using their Booking ID.
router.get('/:bookingId', trackByBookingId);
router.patch('/:bookingId', protect, authorize('driver', 'admin'), updateStatus);

module.exports = router;
