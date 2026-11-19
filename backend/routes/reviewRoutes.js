const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { addReview, listReviews, listMyReviews, listAllReviews } = require('../controllers/reviewController');

router.get('/admin', protect, authorize('admin'), listAllReviews);
router.get('/mine', protect, authorize('customer', 'driver'), listMyReviews);
router.get('/', listReviews);
router.post('/', protect, authorize('customer', 'driver'), addReview);

module.exports = router;
