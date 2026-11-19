const express = require('express');
const router = express.Router();
const { listVehicles } = require('../controllers/vehicleController');

router.get('/', listVehicles);

module.exports = router;
