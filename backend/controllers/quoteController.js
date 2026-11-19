const Vehicle = require('../models/Vehicle');
const calculateQuote = require('../utils/calculateQuote');

exports.getQuote = async (req, res, next) => {
  try {
    const { vehicleId, distanceKm, floors, hasLift, services } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const result = calculateQuote({ vehicle, distanceKm, floors, hasLift, services });
    res.json(result);
  } catch (err) { next(err); }
};
