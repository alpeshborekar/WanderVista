require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('./models/Destination');

const destinations = [
  {
    name: 'Bali', country: 'Indonesia', flag: '🇮🇩',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    rating: 4.9, price: 899, category: 'beach', featured: true, duration: '7 Days',
    description: 'Tropical paradise with stunning temples, rice terraces, and pristine beaches.',
    highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur']
  },
  {
    name: 'Switzerland', country: 'Switzerland', flag: '🇨🇭',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
    rating: 4.8, price: 1299, category: 'mountain', featured: true, duration: '10 Days',
    description: 'Breathtaking Alpine landscapes, pristine lakes, and charming medieval villages.',
    highlights: ['Matterhorn', 'Lake Geneva', 'Jungfraujoch', 'Zurich Old Town']
  },
  {
    name: 'Paris', country: 'France', flag: '🇫🇷',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    rating: 4.7, price: 799, category: 'city', featured: false, duration: '5 Days',
    description: 'The City of Light — world-class art, cuisine, and the iconic Eiffel Tower.',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Montmartre', 'Seine River Cruise']
  },
  {
    name: 'Dubai', country: 'UAE', flag: '🇦🇪',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    rating: 4.8, price: 1099, category: 'city', featured: true, duration: '7 Days',
    description: 'Futuristic skyline, luxury shopping, and desert adventures in the Arabian Gulf.',
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Desert Safari', 'Palm Jumeirah']
  },
  {
    name: 'Maldives', country: 'Maldives', flag: '🇲🇻',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    rating: 5.0, price: 1599, category: 'beach', featured: true, duration: '7 Days',
    description: 'Crystal-clear lagoons, overwater bungalows, and vibrant coral reefs.',
    highlights: ['Overwater Bungalows', 'Snorkeling', 'Dolphin Watching', 'Sunset Cruises']
  },
  {
    name: 'Japan', country: 'Japan', flag: '🇯🇵',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80',
    rating: 4.9, price: 999, category: 'culture', featured: false, duration: '12 Days',
    description: 'Ancient temples, futuristic cities, cherry blossoms, and world-renowned cuisine.',
    highlights: ['Mount Fuji', 'Tokyo Shibuya', 'Kyoto Temples', 'Cherry Blossom Season']
  },
  {
    name: 'Santorini', country: 'Greece', flag: '🇬🇷',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    rating: 4.8, price: 1199, category: 'beach', featured: false, duration: '7 Days',
    description: 'Iconic white-washed villages perched above the stunning Aegean Sea caldera.',
    highlights: ['Oia Sunset', 'Blue Dome Churches', 'Volcanic Beaches', 'Wine Tours']
  },
  {
    name: 'Patagonia', country: 'Argentina', flag: '🇦🇷',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    rating: 4.7, price: 1399, category: 'adventure', featured: false, duration: '14 Days',
    description: 'Raw, untamed wilderness at the bottom of the world — glaciers, peaks, and pampas.',
    highlights: ['Perito Moreno Glacier', 'Torres del Paine', 'El Chaltén Hiking', 'Whale Watching']
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wandervista');
    console.log('Connected to MongoDB');
    await Destination.deleteMany({});
    await Destination.insertMany(destinations);
    console.log(`✅ Seeded ${destinations.length} destinations`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
