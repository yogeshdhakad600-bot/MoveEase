const express = require('express');
const router = express.Router();
const { getRouteDistance } = require('../controllers/mapsController');

router.get('/route', getRouteDistance);
module.exports = router;
