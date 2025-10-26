const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Admin = require('../models/Admin');

// Initial products data
const products = [
  {
    name: "Organic Fresh Bananas",
    description: "Fresh organic bananas, naturally ripened",
    price: 45,
    originalPrice: 60,
    discount: 25,
    category: "Fruits & Vegetables",
    image: "/images/product-img-1.jpg",
    unit: "1 dozen",
    rating: 4.5,
    reviews: 120,
    inStock: true,
    stock: 100,
    featured: true
  },
  {
    name: "Fresh Red Apples",
    description: "Crisp and juicy red apples",
    price: 150,
    originalPrice: 180,
    discount: 17,
    category: "Fruits & Vegetables",
    image: "/images/product-img-2.jpg",
    unit: "1kg",
    rating: 4.7,
    reviews: 85,
    inStock: true,
    stock: 75,
    featured: true
  },
  {
    name: "Amul Fresh Milk",
    description: "Pure and fresh full cream milk",
    price: 60,
    originalPrice: 65,
    discount: 8,
    category: "Dairy & Eggs",
    image: "/images/product-img-3.jpg",
    unit: "1L",
    rating: 4.8,
    reviews: 250,
    inStock: true,
    stock: 200,
    featured: true
  }
];

// @route   POST /api/seed
// @desc    Seed database with initial data
// @access  Public (should be protected in production)
router.post('/', async (req, res) => {
  try {
    // Clear existing data
    await Product.destroy({ where: {}, truncate: true });
    await Admin.destroy({ where: {}, truncate: true });

    // Insert products
    const createdProducts = await Product.bulkCreate(products);

    // Create default admin
    const admin = await Admin.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@freshvilla.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'super-admin'
    });

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        products: createdProducts.length,
        admin: admin.email
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
