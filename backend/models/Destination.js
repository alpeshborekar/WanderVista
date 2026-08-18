const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  flag: { type: String, default: '' },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['beach', 'mountain', 'city', 'adventure', 'culture'], default: 'city' },
  featured: { type: Boolean, default: false },
  duration: { type: String, default: '7 Days' },
  highlights: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
