const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET /api/banners
// @desc    Get all banners (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, active } = req.query;

    let where = {};
    
    if (type) where.type = type;
    if (active === 'true') {
      where.isActive = true;
      // Only show banners within their date range
      const now = new Date();
      where[Op.or] = [
        { startDate: null },
        { startDate: { [Op.lte]: now } }
      ];
      where[Op.and] = [
        {
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: now } }
          ]
        }
      ];
    }

    const banners = await Banner.findAll({
      where,
      order: [['position', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/banners/:id
// @desc    Get single banner
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/banners
// @desc    Create new banner
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const banner = await Banner.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/banners/:id
// @desc    Update banner
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    let banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    await banner.update(req.body);

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/banners/:id
// @desc    Delete banner
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    await banner.destroy();

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PATCH /api/banners/:id/toggle
// @desc    Toggle banner active status
// @access  Private (Admin only)
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    await banner.update({ isActive: !banner.isActive });

    res.json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PATCH /api/banners/:id/position
// @desc    Update banner position
// @access  Private (Admin only)
router.patch('/:id/position', protect, async (req, res) => {
  try {
    const { position } = req.body;
    
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    await banner.update({ position: Number(position) });

    res.json({
      success: true,
      message: 'Banner position updated successfully',
      data: banner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
