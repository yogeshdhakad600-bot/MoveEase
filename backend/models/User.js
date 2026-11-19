const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'driver', 'admin'], default: 'customer' },
  licenseNumber: { type: String },
  licenseExpiryDate: { type: Date },
  yearsExperience: { type: Number, min: 0, max: 60 },
  vehicleAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
