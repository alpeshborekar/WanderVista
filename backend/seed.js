require('dotenv').config();
const mongoose = require('mongoose');
const Package = require('./models/Package');

const packages = [
  {
    id: 'swiss-alps-express',
    title: 'Swiss Alps & Glacier Express Tour',
    destination: 'Interlaken & Zermatt',
    country: 'Switzerland',
    flag: '🇨🇭',
    category: 'Mountain & Alpine',
    price: 145000,
    duration: '8 Days / 7 Nights',
    days: 8,
    nights: 7,
    groupSize: 'Small group (Max 12)',
    rating: 4.9,
    reviewCount: 94,
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1000&q=80',
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1000&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
      'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1000&q=80'
    ],
    shortDescription: 'Traverse Switzerland’s alpine wonders from Lucerne and Interlaken to the iconic Matterhorn in Zermatt aboard the Glacier Express.',
    overview: 'Experience the pinnacle of European mountain beauty. This curated 8-day itinerary takes you through alpine meadows, pristine glacial lakes, and towering peaks. Ride the world-renowned Glacier Express panoramic train, ascend the Jungfraujoch — the Top of Europe, and unwind in charming Swiss villages with authentic local cuisine.',
    included: [
      '7 nights in handpicked 4-star boutique hotels',
      'Daily Swiss buffet breakfast and 4 three-course dinners',
      'First-class panoramic Glacier Express train ticket',
      'Jungfraujoch Mountain railway excursion pass',
      'Airport meet & greet transfers in Zurich and Geneva',
      'Dedicated English-speaking certified mountain guide'
    ],
    excluded: [
      'International round-trip flights',
      'Travel and medical insurance',
      'Lunches and unlisted personal expenses',
      'Optional tandem paragliding in Interlaken'
    ],
    availableDates: ['2026-09-12', '2026-09-26', '2026-10-10', '2026-11-07', '2026-12-05'],
    itinerary: [
      { day: 1, title: 'Arrival in Zurich & Transfer to Lucerne', description: 'Arrive at Zurich Airport. Meet your tour manager and take a scenic train to Lucerne.' },
      { day: 2, title: 'Mount Pilatus Golden Roundtrip', description: 'Ascend Mount Pilatus via the world’s steepest cogwheel railway with Lake Lucerne views.' },
      { day: 3, title: 'Lucerne to Interlaken & Lake Brienz Cruise', description: 'Travel through the Brunig Pass to Interlaken. Cruise across turquoise Lake Brienz.' },
      { day: 4, title: 'Jungfraujoch — Top of Europe', description: 'Board the Eiger Express gondola and cogwheel train up to Jungfraujoch (3,454m).' },
      { day: 5, title: 'Glacier Express to Zermatt', description: 'Embark on the Glacier Express into car-free Zermatt.' },
      { day: 6, title: 'Gornergrat & Matterhorn Views', description: 'Ride the Gornergrat railway for classic views of the Matterhorn reflected in Riffelsee.' },
      { day: 7, title: 'Zermatt Alpine Leisure & Farewell Dinner', description: 'Relax at your mountain resort and enjoy a farewell Swiss fondue dinner.' },
      { day: 8, title: 'Transfer to Geneva & Departure', description: 'Scenic morning train to Geneva Airport for onward flight.' }
    ]
  },
  {
    id: 'japan-cultural-odyssey',
    title: 'Japan Cultural Odyssey: Tokyo to Kyoto',
    destination: 'Tokyo, Hakone & Kyoto',
    country: 'Japan',
    flag: '🇯🇵',
    category: 'Cultural Heritage',
    price: 168000,
    duration: '10 Days / 9 Nights',
    days: 10,
    nights: 9,
    groupSize: 'Small group (Max 14)',
    rating: 4.9,
    reviewCount: 112,
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&q=80',
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1000&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1000&q=80'
    ],
    shortDescription: 'Immerse yourself in Japan’s timeless traditions and modern marvels, from Tokyo’s neon avenues to Kyoto’s tranquil bamboo groves and historic shrines.',
    overview: 'A balanced 10-day journey bridging the contrast of ultra-modern Tokyo with the peaceful sanctuaries of Hakone and imperial Kyoto.',
    included: [
      '9 nights accommodation including 1 night at a traditional Hakone Ryokan',
      'Daily breakfasts, 2 Kaiseki multi-course dinners, and 1 Tokyo Ramen masterclass',
      '7-Day JR Pass for high-speed Shinkansen bullet trains',
      'Private authentic Tea Ceremony in Kyoto Gion district',
      'Lake Ashi cruise & Mount Fuji viewpoint excursion',
      'Expert bilingual local tour director throughout'
    ],
    excluded: [
      'International flights to Tokyo / from Osaka',
      'Single room supplement (optional)',
      'Travel insurance',
      'Personal shopping and baggage courier fees'
    ],
    availableDates: ['2026-09-15', '2026-10-06', '2026-10-24', '2026-11-14', '2026-12-02'],
    itinerary: [
      { day: 1, title: 'Arrival in Tokyo', description: 'Arrive in Tokyo. Check in and evening walk in Shibuya.' },
      { day: 2, title: 'Tokyo Ancient & Modern', description: 'Visit Senso-ji Temple and Meiji Shrine.' },
      { day: 3, title: 'Tsukiji Market & TeamLab Planets', description: 'Tsukiji food tour and digital art experience.' },
      { day: 4, title: 'Tokyo to Hakone & Mount Fuji', description: 'Cruise Lake Ashi and stay at an onsen ryokan.' },
      { day: 5, title: 'Bullet Train to Kyoto', description: 'Shinkansen to Kyoto and walk through Gion.' },
      { day: 6, title: 'Arashiyama & Golden Pavilion', description: 'Bamboo grove and Kinkaku-ji temple.' },
      { day: 7, title: 'Fushimi Inari & Nara Deer', description: 'Torii gates hike and Nara deer park.' },
      { day: 8, title: 'Tea Ceremony & Nishiki Market', description: 'Matcha tea masterclass and market tasting.' },
      { day: 9, title: 'Day Trip to Osaka', description: 'Osaka Castle and Dotonbori nightlife.' },
      { day: 10, title: 'Departure from Osaka', description: 'Transfer to Kansai International Airport.' }
    ]
  },
  {
    id: 'bali-komodo-island-explorer',
    title: 'Bali & Komodo Island Nature Explorer',
    destination: 'Ubud, Nusa Penida & Komodo',
    country: 'Indonesia',
    flag: '🇮🇩',
    category: 'Beach & Coastal',
    price: 88000,
    duration: '7 Days / 6 Nights',
    days: 7,
    nights: 6,
    groupSize: 'Max 10 travelers',
    rating: 4.8,
    reviewCount: 78,
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1000&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&q=80',
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1000&q=80'
    ],
    shortDescription: 'Discover Bali’s lush jungle sanctuaries, terraced rice valleys, and embark on a private boat voyage to Komodo National Park’s dragons and pink beaches.',
    overview: 'From Ubud’s rainforest retreats and waterfalls to the surreal Pink Beach and prehistoric dragons of Komodo National Park.',
    included: [
      '4 nights in 4-star Ubud & Seminyak jungle/beach resorts',
      '2 nights in Labuan Bajo (Komodo gateway) premium hotel',
      'Full-day private Komodo National Park speedboat tour',
      'Snorkeling gear & entry permits for Komodo & Padar Island',
      'Daily breakfast, 3 lunches during excursions, 2 local dinners',
      'Domestic flight tickets (Bali - Labuan Bajo return)'
    ],
    excluded: [
      'International flights to/from Denpasar (DPS)',
      'Travel insurance',
      'Tipping for boat crew and local rangers'
    ],
    availableDates: ['2026-09-08', '2026-09-22', '2026-10-15', '2026-11-10', '2026-12-08'],
    itinerary: [
      { day: 1, title: 'Arrival in Bali & Ubud Jungle', description: 'Arrive in Denpasar, transfer to Ubud rainforest resort.' },
      { day: 2, title: 'Tegalalang Rice Terraces & Waterfalls', description: 'Visit rice terraces and sacred water temple.' },
      { day: 3, title: 'Nusa Penida Coastal Expedition', description: 'Speedboat to Kelingking cliff and Broken Beach.' },
      { day: 4, title: 'Flight to Labuan Bajo', description: 'Fly to Flores and view sunset over Komodo.' },
      { day: 5, title: 'Komodo Dragons & Pink Beach', description: 'Padar Island hike, Komodo dragon trek, and Pink beach snorkel.' },
      { day: 6, title: 'Return to Bali Seminyak Beach', description: 'Fly back to Bali for sunset beach dinner.' },
      { day: 7, title: 'Departure', description: 'Transfer to Denpasar Airport.' }
    ]
  },
  {
    id: 'rajasthan-royal-heritage',
    title: 'Royal Rajasthan Heritage & Palaces',
    destination: 'Jaipur, Jodhpur & Udaipur',
    country: 'India',
    flag: '🇮🇳',
    category: 'Cultural Heritage',
    price: 65000,
    duration: '7 Days / 6 Nights',
    days: 7,
    nights: 6,
    groupSize: 'Max 10 travelers',
    rating: 4.9,
    reviewCount: 140,
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1000&q=80',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1000&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=1000&q=80'
    ],
    shortDescription: 'Journey through the land of Maharajas, visiting Jaipur’s Amber Fort, Jodhpur’s blue city and Mehrangarh, and romantic Udaipur’s Lake Pichola palaces.',
    overview: 'Immerse in India’s regal past across Rajasthan’s royal triangle with stays in authentic heritage Haveli mansions.',
    included: [
      '6 nights in restored heritage hotels and royal Havelis',
      'Daily royal breakfast and 3 traditional Rajasthani Thali dinners',
      'Chauffeur-driven air-conditioned private vehicle throughout',
      'All monument entry tickets and camera fees',
      'Private sunset boat cruise on Lake Pichola in Udaipur',
      'Certified local historian guides at each palace and fort'
    ],
    excluded: [
      'Domestic flights to Jaipur / from Udaipur',
      'Travel insurance',
      'Personal shopping and gratuities'
    ],
    availableDates: ['2026-09-05', '2026-09-19', '2026-10-10', '2026-10-31', '2026-11-21', '2026-12-12'],
    itinerary: [
      { day: 1, title: 'Arrival in Jaipur', description: 'Arrive in Jaipur. Check into heritage hotel and view Hawa Mahal.' },
      { day: 2, title: 'Amber Fort & City Palace', description: 'Amber Fort, City Palace, and Jantar Mantar observatory.' },
      { day: 3, title: 'Jaipur to Jodhpur via Pushkar', description: 'Drive to Jodhpur with Pushkar lake stop.' },
      { day: 4, title: 'Mehrangarh Fort & Blue City', description: 'Explore Mehrangarh Fort and old blue town bazaars.' },
      { day: 5, title: 'Jodhpur to Udaipur via Ranakpur', description: 'Ranakpur marble Jain temple visit en route to Udaipur.' },
      { day: 6, title: 'Udaipur City Palace & Lake Cruise', description: 'City Palace tour and Lake Pichola sunset boat ride.' },
      { day: 7, title: 'Departure', description: 'Saheliyon ki Bari and transfer to Udaipur Airport.' }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wandervista');
    console.log('Connected to MongoDB');
    await Package.deleteMany({});
    await Package.insertMany(packages);
    console.log(`✅ Seeded ${packages.length} realistic travel packages`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
