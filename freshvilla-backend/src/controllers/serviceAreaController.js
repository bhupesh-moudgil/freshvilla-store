const ServiceArea = require('../models/ServiceArea');
const Store = require('../models/Store');
const { Op } = require('sequelize');

// Get all service areas for a store
exports.getServiceAreas = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { city, pincode, isActive } = req.query;

    const where = { storeId };
    
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (pincode) where.pincode = pincode;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const areas = await ServiceArea.findAll({
      where,
      order: [['priority', 'ASC'], ['city', 'ASC'], ['areaName', 'ASC']],
    });

    res.json({
      success: true,
      data: areas,
    });
  } catch (error) {
    console.error('Get service areas error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create service area
exports.createServiceArea = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      city,
      state,
      areaName,
      pincode,
      latitude,
      longitude,
      deliveryTime,
      deliveryFee,
      minimumOrder,
      priority,
      serviceHours,
      notes,
    } = req.body;

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Check for duplicate area
    const existing = await ServiceArea.findOne({
      where: { storeId, city, areaName },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Service area already exists for this city and area',
      });
    }

    const serviceArea = await ServiceArea.create({
      storeId,
      city,
      state,
      areaName,
      pincode,
      latitude,
      longitude,
      deliveryTime: deliveryTime || 60,
      deliveryFee: deliveryFee || 0,
      minimumOrder: minimumOrder || 0,
      priority: priority || 1,
      serviceHours,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Service area created successfully',
      data: serviceArea,
    });
  } catch (error) {
    console.error('Create service area error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update service area
exports.updateServiceArea = async (req, res) => {
  try {
    const { storeId, areaId } = req.params;
    const updateData = req.body;

    const serviceArea = await ServiceArea.findOne({
      where: { id: areaId, storeId },
    });

    if (!serviceArea) {
      return res.status(404).json({ success: false, message: 'Service area not found' });
    }

    await serviceArea.update(updateData);

    res.json({
      success: true,
      message: 'Service area updated successfully',
      data: serviceArea,
    });
  } catch (error) {
    console.error('Update service area error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete service area
exports.deleteServiceArea = async (req, res) => {
  try {
    const { storeId, areaId } = req.params;

    const serviceArea = await ServiceArea.findOne({
      where: { id: areaId, storeId },
    });

    if (!serviceArea) {
      return res.status(404).json({ success: false, message: 'Service area not found' });
    }

    await serviceArea.destroy();

    res.json({
      success: true,
      message: 'Service area deleted successfully',
    });
  } catch (error) {
    console.error('Delete service area error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check service availability
exports.checkServiceAvailability = async (req, res) => {
  try {
    const { city, pincode, address } = req.query;

    if (!city && !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide city or pincode',
      });
    }

    const where = { isActive: true };
    
    if (pincode) {
      where.pincode = pincode;
    } else if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    const availableStores = await ServiceArea.findAll({
      where,
      include: [{
        model: Store,
        as: 'store',
        where: { isActive: true },
        attributes: ['id', 'name', 'phone', 'email', 'rating'],
      }],
      order: [['priority', 'ASC'], ['deliveryTime', 'ASC']],
    });

    // Filter by current time availability
    const availableNow = availableStores.filter(area => area.isCurrentlyOpen());

    res.json({
      success: true,
      data: {
        available: availableNow.length > 0,
        storeCount: availableNow.length,
        stores: availableNow.map(area => ({
          areaId: area.id,
          storeId: area.store.id,
          storeName: area.store.name,
          areaName: area.areaName,
          city: area.city,
          deliveryTime: area.deliveryTime,
          deliveryFee: area.deliveryFee,
          minimumOrder: area.minimumOrder,
          isCurrentlyOpen: true,
        })),
        unavailableStores: availableStores.length - availableNow.length,
      },
    });
  } catch (error) {
    console.error('Check service availability error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route order to appropriate store
exports.routeOrder = async (req, res) => {
  try {
    const { city, pincode, address, orderValue } = req.body;

    if (!city && !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide delivery city or pincode',
      });
    }

    // Find applicable service areas
    const where = { isActive: true };
    
    if (pincode) {
      where.pincode = pincode;
    } else if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    const serviceAreas = await ServiceArea.findAll({
      where,
      include: [{
        model: Store,
        as: 'store',
        where: { isActive: true },
      }],
      order: [['priority', 'ASC'], ['deliveryTime', 'ASC']],
    });

    if (serviceAreas.length === 0) {
      return res.json({
        success: false,
        message: 'Service not available in your area yet',
        available: false,
      });
    }

    // Filter by current availability and minimum order
    const eligible = serviceAreas.filter(area => {
      return area.isCurrentlyOpen() && 
             (!area.minimumOrder || orderValue >= area.minimumOrder);
    });

    if (eligible.length === 0) {
      return res.json({
        success: false,
        message: 'No stores currently available for delivery',
        available: false,
        reasons: {
          outsideServiceHours: serviceAreas.some(a => !a.isCurrentlyOpen()),
          belowMinimumOrder: serviceAreas.some(a => orderValue < a.minimumOrder),
        },
      });
    }

    // Select best store (highest priority, fastest delivery)
    const selectedArea = eligible[0];

    res.json({
      success: true,
      available: true,
      data: {
        serviceAreaId: selectedArea.id,
        storeId: selectedArea.storeId,
        storeName: selectedArea.store.name,
        areaName: selectedArea.areaName,
        deliveryTime: selectedArea.deliveryTime,
        deliveryFee: selectedArea.deliveryFee,
        estimatedDelivery: new Date(Date.now() + selectedArea.deliveryTime * 60000).toISOString(),
      },
    });
  } catch (error) {
    console.error('Route order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get delivery estimate
exports.getDeliveryEstimate = async (req, res) => {
  try {
    const { storeId, city, pincode } = req.query;

    const where = { storeId, isActive: true };
    
    if (pincode) {
      where.pincode = pincode;
    } else if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide city or pincode',
      });
    }

    const serviceArea = await ServiceArea.findOne({ where });

    if (!serviceArea) {
      return res.json({
        success: false,
        message: 'Delivery not available to this location',
        available: false,
      });
    }

    const estimatedDelivery = new Date(Date.now() + serviceArea.deliveryTime * 60000);

    res.json({
      success: true,
      available: true,
      data: {
        deliveryTime: serviceArea.deliveryTime,
        deliveryFee: serviceArea.deliveryFee,
        minimumOrder: serviceArea.minimumOrder,
        estimatedDelivery: estimatedDelivery.toISOString(),
        isCurrentlyOpen: serviceArea.isCurrentlyOpen(),
      },
    });
  } catch (error) {
    console.error('Get delivery estimate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
