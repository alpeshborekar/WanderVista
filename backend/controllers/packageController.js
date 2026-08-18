const Package = require('../models/Package');

exports.getAllPackages = async (req, res) => {
  try {
    const { category, search, sort, maxPrice } = req.query;
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    let sortObj = { featured: -1, rating: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'duration') sortObj = { days: 1 };
    else if (sort === 'rating') sortObj = { rating: -1 };

    const packages = await Package.find(query).sort(sortObj);
    res.json({ success: true, count: packages.length, packages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findOne({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
