const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const support = require('../controllers/supportController');

router.use(protect);
router.post('/', authorize('customer', 'driver'), support.createTicket);
router.get('/mine', authorize('customer', 'driver'), support.myTickets);
router.get('/all', authorize('admin'), support.allTickets);
router.patch('/:id/respond', authorize('admin'), support.respondTicket);
router.delete('/:id', authorize('admin', 'customer', 'driver'), support.deleteTicket);

module.exports = router;
