const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const admin = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/stats', admin.dashboardStats);
router.get('/bookings', admin.listBookings);
router.delete('/bookings/:bookingId', admin.deleteBooking);
router.patch('/bookings/:bookingId/assign', admin.assignDriver);
router.patch('/bookings/:bookingId/unassign', admin.unassignDriver);
router.get('/users', admin.listUsers);
router.delete('/users/:userId', admin.deleteUser);
router.post('/staff', admin.createStaff);
router.get('/vehicles', admin.listVehicles);
router.post('/vehicles', admin.addVehicle);

module.exports = router;
