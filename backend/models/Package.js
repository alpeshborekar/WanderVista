const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  destination: { type: String, required: true },
  country: { type: String, required: true },
  flag: { type: String, default: '✈️' },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  days: { type: Number, default: 7 },
  nights: { type: Number, default: 6 },
  groupSize: { type: String, default: 'Max 12 travelers' },
  capacity: { type: Number, default: 12 },
  rating: { type: Number, default: 4.9 },
  reviewCount: { type: Number, default: 50 },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  coverImage: { type: String, required: true },
  images: [{ type: String }],
  shortDescription: { type: String, required: true },
  overview: { type: String, required: true },
  included: [{ type: String }],
  excluded: [{ type: String }],
  availableDates: [{ type: String }],
  schedule: [{
    date: { type: String, required: true },
    capacity: { type: Number, default: 12 },
    bookedSpots: { type: Number, default: 0 },
    isClosed: { type: Boolean, default: false }
  }],
  itinerary: [{
    day: { type: Number },
    title: { type: String },
    description: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
