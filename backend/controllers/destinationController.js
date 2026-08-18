const Destination = require('../models/Destination');

exports.getAll = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    let sortObj = {};
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else sortObj = { featured: -1, rating: -1 };
    const destinations = await Destination.find(query).sort(sortObj);
    res.json({ success: true, count: destinations.length, destinations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
    res.json({ success: true, destination });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
