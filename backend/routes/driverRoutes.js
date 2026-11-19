const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const { myDeliveries, uploadProof } = require('../controllers/driverController');

router.use(protect, authorize('driver'));
router.get('/deliveries', myDeliveries);
router.patch('/deliveries/:bookingId/proof', uploadProof);

module.exports = router;
