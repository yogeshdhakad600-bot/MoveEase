const User = require('../models/User');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Payment = require('../models/Payment');
const Tracking = require('../models/Tracking');
const Review = require('../models/Review');
const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');

async function releaseUnusedVehicles(bookings, extraVehicleIds = []) {
  const vehicleIds = [...new Set([
    ...bookings.filter((booking) => booking.vehicle).map((booking) => String(booking.vehicle)),
    ...extraVehicleIds.map(String),
  ])];
  if (!vehicleIds.length) return;

  const bookingIds = bookings.map((booking) => booking._id);
  const activeVehicleIds = await Booking.distinct('vehicle', {
    vehicle: { $in: vehicleIds },
    _id: { $nin: bookingIds },
    status: { $nin: ['Delivered', 'Cancelled'] },
  });
  const activeVehicleSet = new Set(activeVehicleIds.map(String));
  const releasedVehicleIds = vehicleIds.filter((vehicleId) => !activeVehicleSet.has(vehicleId));
  if (releasedVehicleIds.length) {
    await Vehicle.updateMany(
      { _id: { $in: releasedVehicleIds }, status: 'assigned' },
      { $set: { status: 'available' }, $unset: { assignedDriver: 1 } },
    );
    await Vehicle.updateMany(
      { _id: { $in: releasedVehicleIds }, status: { $ne: 'assigned' } },
      { $unset: { assignedDriver: 1 } },
    );
  }
}

exports.dashboardStats = async (req, res, next) => {
  try {
    const [customers, drivers, bookings, revenueAgg] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'driver' }),
      Booking.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    res.json({ customers, drivers, bookings, revenue: revenueAgg[0]?.total || 0 });
  } catch (err) { next(err); }
};

exports.listBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('customer driver vehicle requestedVehicle', '-password').sort('-createdAt');
    res.json(bookings);
  } catch (err) { next(err); }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const bookingId = booking._id;
    await releaseUnusedVehicles([booking]);
    await Promise.all([
      Payment.deleteMany({ booking: bookingId }),
      Review.deleteMany({ booking: bookingId }),
      SupportTicket.deleteMany({ booking: bookingId }),
      Tracking.deleteMany({ booking: bookingId }),
    ]);
    await booking.deleteOne();
    res.json({ message: 'Booking and related records deleted' });
  } catch (err) { next(err); }
};

exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId, vehicleId } = req.body;
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!booking.requestedVehicle && booking.vehicle) booking.requestedVehicle = booking.vehicle;
    booking.driver = driverId;
    if (vehicleId) booking.vehicle = vehicleId;
    const shouldStartPacking = booking.status === 'Booking Confirmed';
    if (shouldStartPacking) {
      booking.status = 'Packing';
      booking.statusHistory.push({ status: 'Packing', note: 'Driver assigned' });
    }
    await booking.save();
    if (vehicleId) await Vehicle.findByIdAndUpdate(vehicleId, { status: 'assigned', assignedDriver: driverId });
    if (shouldStartPacking) {
      await Tracking.create({ booking: booking._id, status: 'Packing', updatedBy: req.user._id });
    }
    res.json(booking);
  } catch (err) { next(err); }
};

exports.unassignDriver = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (['Out for Delivery', 'Delivered', 'Cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'A booking cannot be unassigned after delivery starts or it is cancelled' });
    }

    const assignedVehicle = booking.vehicle;
    const assignedDriver = booking.driver;
    if (!booking.requestedVehicle && assignedVehicle) booking.requestedVehicle = assignedVehicle;
    booking.driver = null;
    booking.vehicle = null;
    await booking.save();

    if (assignedVehicle) {
      await Vehicle.findOneAndUpdate(
        { _id: assignedVehicle, assignedDriver: assignedDriver || null },
        { $set: { status: 'available' }, $unset: { assignedDriver: 1 } },
      );
    }
    res.json(booking);
  } catch (err) { next(err); }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').lean();
    if (role === 'driver' && users.length) {
      const assignments = await Booking.find({
        driver: { $in: users.map((driver) => driver._id) },
        status: { $nin: ['Delivered', 'Cancelled'] },
      }).select('bookingId driver').lean();
      const bookingIdsByDriver = new Map();
      for (const booking of assignments) {
        const driverId = String(booking.driver);
        const bookingIds = bookingIdsByDriver.get(driverId) || [];
        bookingIds.push(booking.bookingId);
        bookingIdsByDriver.set(driverId, bookingIds);
      }
      return res.json(users.map((driver) => ({
        ...driver,
        assignedBookings: bookingIdsByDriver.get(String(driver._id)) || [],
      })));
    }
    res.json(users);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Admin accounts cannot be deleted here' });

    const userId = user._id;
    if (user.role === 'customer') {
      const bookings = await Booking.find({ customer: userId }).select('_id vehicle');
      const bookingIds = bookings.map((booking) => booking._id);
      await releaseUnusedVehicles(bookings);
      await Promise.all([
        Payment.deleteMany({ $or: [{ customer: userId }, { booking: { $in: bookingIds } }] }),
        Review.deleteMany({ $or: [{ customer: userId }, { booking: { $in: bookingIds } }] }),
        SupportTicket.deleteMany({ $or: [{ customer: userId }, { booking: { $in: bookingIds } }] }),
        Tracking.deleteMany({ booking: { $in: bookingIds } }),
        Notification.deleteMany({ user: userId }),
        Booking.deleteMany({ customer: userId }),
      ]);
    } else if (user.role === 'driver') {
      const bookings = await Booking.find({ driver: userId }).select('_id vehicle');
      const driverVehicleIds = await Vehicle.distinct('_id', { assignedDriver: userId });
      await releaseUnusedVehicles(bookings, driverVehicleIds);
      await Promise.all([
        Booking.updateMany({ driver: userId }, { $set: { driver: null, vehicle: null } }),
        Tracking.updateMany({ updatedBy: userId }, { $set: { updatedBy: null } }),
        Notification.deleteMany({ user: userId }),
        SupportTicket.deleteMany({ requester: userId }),
      ]);
    }

    await user.deleteOne();
    res.json({ message: `${user.role === 'customer' ? 'Customer' : 'Driver'} and related data deleted` });
  } catch (err) { next(err); }
};

exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, licenseNumber } = req.body; // role: driver | admin
    const user = await User.create({ name, email, phone, password, role, licenseNumber });
    res.status(201).json({ id: user._id, name: user.name, role: user.role });
  } catch (err) { next(err); }
};

exports.listVehicles = async (req, res, next) => {
  try { res.json(await Vehicle.find()); } catch (err) { next(err); }
};

exports.addVehicle = async (req, res, next) => {
  try { res.status(201).json(await Vehicle.create(req.body)); } catch (err) { next(err); }
};
