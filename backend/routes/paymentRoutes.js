const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { pay, getMyPayments } = require('../controllers/paymentController');

router.use(protect, authorize('customer'));
router.post('/', pay);
router.get('/mine', getMyPayments);

module.exports = router;
