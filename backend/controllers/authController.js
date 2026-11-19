const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, licenseNumber: user.licenseNumber, licenseExpiryDate: user.licenseExpiryDate, yearsExperience: user.yearsExperience, vehicleAssigned: user.vehicleAssigned };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, licenseNumber, licenseExpiryDate, yearsExperience } = req.body;
    const role = req.body.role === 'driver' ? 'driver' : 'customer';
    if (role === 'driver') {
      const experience = Number(yearsExperience);
      const expiryDate = new Date(licenseExpiryDate);
      if (!licenseNumber?.trim() || !licenseExpiryDate || Number.isNaN(expiryDate.getTime()) || !Number.isInteger(experience) || experience < 0 || experience > 60) {
        return res.status(400).json({ message: 'Driver license number, valid expiry date, and years of experience are required.' });
      }
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      ...(role === 'driver' && { licenseNumber: licenseNumber.trim(), licenseExpiryDate, yearsExperience: Number(yearsExperience) }),
    });
    res.status(201).json({ user: safeUser(user), token: generateToken(user._id, user.role) });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (role && user.role !== role && !(user.role === 'admin' && role === 'customer')) {
      return res.status(403).json({ message: `This account is a ${user.role} account. Please select ${user.role} login.` });
    }
    res.json({ user: safeUser(user), token: generateToken(user._id, user.role) });
  } catch (err) { next(err); }
};

exports.me = async (req, res) => res.json({ user: safeUser(req.user) });

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'email', 'password'];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    if (updates.email) {
      const exists = await User.findOne({ email: updates.email.toLowerCase(), _id: { $ne: req.user._id } });
      if (exists) return res.status(409).json({ message: 'That email is already in use.' });
      updates.email = updates.email.toLowerCase();
    }
    Object.assign(req.user, updates);
    await req.user.save();
    res.json({ user: safeUser(req.user) });
  } catch (err) { next(err); }
};
