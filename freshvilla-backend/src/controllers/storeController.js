const Store = require('../models/Store');
const { generateStoreData, getStoreDisplayInfo, isValidStoreUrl } = require('../utils/storeUrlGenerator');

// @desc    Create new store with auto-generated URL
// @route   POST /api/stores
// @access  Private (Super Admin only)
exports.createStore = async (req, res) => {
  try {
    const { name, city, state, cityCode, stateCode, ...otherData } = req.body;

    // Validate required fields
    if (!city || !state || !cityCode || !stateCode) {
      return res.status(400).json({
        success: false,
        message: 'City, state, cityCode, and stateCode are required'
      });
    }

    // Generate store data with URL and number
    const storeData = await generateStoreData({
      name: name || `FreshVilla ${city}`,
      city,
      state,
      cityCode: cityCode.toUpperCase(),
      stateCode: stateCode.toUpperCase(),
      ...otherData
    });

    // Create store
    const store = await Store.create(storeData);

    // Get display info
    const displayInfo = await getStoreDisplayInfo(store.storeUrl);

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: {
        store,
        displayInfo
      }
    });
  } catch (error) {
    console.error('Store creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all stores with display info
// @route   GET /api/stores
// @access  Private
exports.getAllStores = async (req, res) => {
  try {
    const { active, state, city, search } = req.query;

    const where = {};
    if (active !== undefined) where.isActive = active === 'true';
    if (state) where.state = state;
    if (city) where.city = city;

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { storeUrl: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const stores = await Store.findAll({
      where,
      attributes: [
        'id',
        'name',
        'slug',
        'storeNumber',
        'storeUrl',
        'city',
        'cityCode',
        'state',
        'stateCode',
        'address',
        'email',
        'phone',
        'isActive',
        'isFeatured',
        'totalProducts',
        'totalOrders',
        'rating',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add display info to each store
    const storesWithDisplay = stores.map(store => ({
      ...store.toJSON(),
      displayInfo: {
        displayName: store.name, // "FreshVilla New Delhi"
        shortName: `${store.city} ${store.storeNumber}`, // "New Delhi 001"
        url: store.storeUrl, // "dl-ndl-001"
        urlFull: `https://freshvilla.in/store/${store.storeUrl}`,
        location: `${store.city}, ${store.state}`,
        codes: `${store.stateCode}-${store.cityCode}`
      }
    }));

    res.json({
      success: true,
      count: storesWithDisplay.length,
      data: storesWithDisplay
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get store by URL
// @route   GET /api/stores/url/:storeUrl
// @access  Public
exports.getStoreByUrl = async (req, res) => {
  try {
    const { storeUrl } = req.params;

    // Validate URL format
    if (!isValidStoreUrl(storeUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store URL format. Expected: state-city-number (e.g., dl-ndl-001)'
      });
    }

    const store = await Store.findOne({
      where: { storeUrl, isActive: true }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const displayInfo = await getStoreDisplayInfo(storeUrl);

    res.json({
      success: true,
      data: {
        store,
        displayInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Private
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const displayInfo = store.storeUrl 
      ? await getStoreDisplayInfo(store.storeUrl)
      : null;

    res.json({
      success: true,
      data: {
        store,
        displayInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (Super Admin only)
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Don't allow changing storeNumber or storeUrl directly
    const { storeNumber, storeUrl, ...updateData } = req.body;

    // If city/state codes are changing, regenerate URL
    if (updateData.cityCode || updateData.stateCode) {
      const newCityCode = updateData.cityCode || store.cityCode;
      const newStateCode = updateData.stateCode || store.stateCode;
      
      // Keep existing store number but regenerate URL
      const { generateStoreUrl } = require('../utils/storeUrlGenerator');
      updateData.storeUrl = generateStoreUrl(
        newStateCode,
        newCityCode,
        store.storeNumber
      );
    }

    await store.update(updateData);

    const displayInfo = store.storeUrl 
      ? await getStoreDisplayInfo(store.storeUrl)
      : null;

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: {
        store,
        displayInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private (Super Admin only)
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    await store.destroy();

    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get stores by state
// @route   GET /api/stores/by-state/:stateCode
// @access  Public
exports.getStoresByState = async (req, res) => {
  try {
    const { stateCode } = req.params;

    const stores = await Store.findAll({
      where: {
        stateCode: stateCode.toUpperCase(),
        isActive: true
      },
      attributes: ['id', 'name', 'storeUrl', 'city', 'cityCode', 'state', 'stateCode', 'storeNumber'],
      order: [['city', 'ASC'], ['storeNumber', 'ASC']]
    });

    const storesWithDisplay = stores.map(store => ({
      id: store.id,
      displayName: store.name,
      shortName: `${store.city} ${store.storeNumber}`,
      url: store.storeUrl,
      city: store.city,
      state: store.state
    }));

    res.json({
      success: true,
      count: storesWithDisplay.length,
      stateCode: stateCode.toUpperCase(),
      data: storesWithDisplay
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get stores by city
// @route   GET /api/stores/by-city/:cityCode
// @access  Public
exports.getStoresByCity = async (req, res) => {
  try {
    const { cityCode } = req.params;

    const stores = await Store.findAll({
      where: {
        cityCode: cityCode.toUpperCase(),
        isActive: true
      },
      attributes: ['id', 'name', 'storeUrl', 'city', 'cityCode', 'state', 'stateCode', 'storeNumber', 'address', 'phone'],
      order: [['storeNumber', 'ASC']]
    });

    const storesWithDisplay = stores.map(store => ({
      ...store.toJSON(),
      displayName: store.name,
      shortName: `${store.city} ${store.storeNumber}`,
      url: store.storeUrl
    }));

    res.json({
      success: true,
      count: storesWithDisplay.length,
      cityCode: cityCode.toUpperCase(),
      data: storesWithDisplay
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
