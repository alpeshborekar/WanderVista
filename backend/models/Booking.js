const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  packageId: { type: String, required: true },
  packageTitle: { type: String, required: true },
  destination: { type: String, required: true },
  country: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  departureDate: { type: String, required: true },
  travelersCount: { type: Number, required: true, min: 1 },
  leadTraveler: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  additionalTravelers: [{
    fullName: { type: String }
  }],
  specialRequests: { type: String, default: '' },
  pricePerPerson: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  taxes: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  bookingRef: { type: String, unique: true }
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
  if (!this.bookingRef) {
    this.bookingRef = 'WV-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
