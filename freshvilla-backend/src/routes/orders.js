const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');
const { generateOTP, sendCheckoutOTP } = require('../utils/emailService');

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private (Admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/orders/request-otp
// @desc    Request OTP for order verification
// @access  Public
router.post('/request-otp', async (req, res) => {
  try {
    const { customerId, orderTotal } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const crypto = require('crypto');
    customer.emailOtp = crypto.createHash('sha256').update(otp).digest('hex');
    customer.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    customer.emailOtpVerified = false;
    await customer.save();

    // Send OTP email (non-blocking)
    sendCheckoutOTP(customer.email, customer.name, otp, orderTotal).catch(err => {
      console.error('Failed to send checkout OTP:', err);
    });

    res.json({
      success: true,
      message: 'OTP has been sent to your email',
      data: {
        customerId: customer.id,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order (requires OTP verification)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { customerId } = req.body;

    // Verify customer exists and OTP is verified
    if (customerId) {
      const customer = await Customer.findByPk(customerId);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Check if OTP was verified
      if (!customer.emailOtpVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify OTP before placing order',
          requiresOTP: true
        });
      }

      // Reset OTP verification flag after successful order
      customer.emailOtpVerified = false;
      await customer.save();
    }

    const order = await Order.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { orderStatus, cancelReason } = req.body;

    const updateData = { orderStatus };
    if (cancelReason) updateData.cancelReason = cancelReason;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/stats/overview
// @desc    Get order statistics
// @access  Private (Admin)
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
