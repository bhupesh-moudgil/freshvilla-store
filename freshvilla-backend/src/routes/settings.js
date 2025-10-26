const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get all settings
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const settings = await Settings.findAll({
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    // Don't expose encrypted values to client
    const sanitizedSettings = settings.map(setting => ({
      id: setting.id,
      key: setting.key,
      value: setting.encrypted ? '***ENCRYPTED***' : setting.value,
      encrypted: setting.encrypted,
      description: setting.description,
      category: setting.category,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt
    }));

    res.json({
      success: true,
      data: sanitizedSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/settings/:key
// @desc    Get setting by key
// @access  Private (Admin only)
router.get('/:key', protect, async (req, res) => {
  try {
    const setting = await Settings.findOne({ where: { key: req.params.key } });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: setting.id,
        key: setting.key,
        value: setting.encrypted ? '***ENCRYPTED***' : setting.value,
        encrypted: setting.encrypted,
        description: setting.description,
        category: setting.category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/settings
// @desc    Create or update setting
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { key, value, encrypted, description, category } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Key is required'
      });
    }

    const setting = await Settings.setByKey(
      key,
      value,
      encrypted || false,
      description || '',
      category || 'general'
    );

    res.json({
      success: true,
      message: 'Setting saved successfully',
      data: {
        id: setting.id,
        key: setting.key,
        encrypted: setting.encrypted,
        description: setting.description,
        category: setting.category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/settings/:key
// @desc    Delete setting
// @access  Private (Admin only)
router.delete('/:key', protect, async (req, res) => {
  try {
    const deleted = await Settings.destroy({ where: { key: req.params.key } });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/settings/smtp/configure
// @desc    Configure SMTP settings (convenience endpoint)
// @access  Private (Admin only)
router.post('/smtp/configure', protect, async (req, res) => {
  try {
    const { host, port, user, password, from } = req.body;

    if (!host || !port || !user || !password) {
      return res.status(400).json({
        success: false,
        message: 'All SMTP fields are required'
      });
    }

    // Save all SMTP settings
    await Settings.setByKey('smtp_host', host, false, 'SMTP server host', 'email');
    await Settings.setByKey('smtp_port', port.toString(), false, 'SMTP server port', 'email');
    await Settings.setByKey('smtp_user', user, false, 'SMTP username', 'email');
    await Settings.setByKey('smtp_password', password, true, 'SMTP password (encrypted)', 'email');
    
    if (from) {
      await Settings.setByKey('smtp_from', from, false, 'Default sender email', 'email');
    }

    // Reinitialize email service with new settings
    const emailService = require('../utils/emailService');
    // Note: You may need to restart the server for email service to pick up new settings

    res.json({
      success: true,
      message: 'SMTP settings configured successfully. Please restart the server to apply changes.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
