const Vehicle = require('../models/Vehicle');

exports.listVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ status: 'available' });
    res.json(vehicles);
  } catch (err) { next(err); }
};
