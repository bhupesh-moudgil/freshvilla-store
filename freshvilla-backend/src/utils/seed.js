require('dotenv').config();
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const { connectDB } = require('../config/database');

// Initial products data (from your JSON)
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
  },
  {
    name: "Brown Eggs Tray",
    description: "Farm fresh brown eggs",
    price: 80,
    originalPrice: 90,
    discount: 11,
    category: "Dairy & Eggs",
    image: "/images/product-img-4.jpg",
    unit: "12 pcs",
    rating: 4.6,
    reviews: 95,
    inStock: true,
    stock: 150,
    featured: true
  },
  {
    name: "Whole Wheat Bread",
    description: "Freshly baked whole wheat bread",
    price: 35,
    originalPrice: 40,
    discount: 13,
    category: "Bakery",
    image: "/images/product-img-5.jpg",
    unit: "400g",
    rating: 4.3,
    reviews: 65,
    inStock: true,
    stock: 120,
    featured: true
  },
  {
    name: "Basmati Rice Premium",
    description: "Premium quality aged basmati rice",
    price: 180,
    originalPrice: 200,
    discount: 10,
    category: "Groceries",
    image: "/images/product-img-6.jpg",
    unit: "1kg",
    rating: 4.9,
    reviews: 180,
    inStock: true,
    stock: 80,
    featured: true
  },
  {
    name: "Tata Salt",
    description: "Pure and iodized table salt",
    price: 20,
    originalPrice: 22,
    discount: 9,
    category: "Groceries",
    image: "/images/product-img-1.jpg",
    unit: "1kg",
    rating: 4.5,
    reviews: 200,
    inStock: true,
    stock: 250,
    featured: false
  },
  {
    name: "Britannia Cookies",
    description: "Delicious butter cookies",
    price: 35,
    originalPrice: 40,
    discount: 13,
    category: "Snacks & Beverages",
    image: "/images/product-img-2.jpg",
    unit: "200g",
    rating: 4.4,
    reviews: 110,
    inStock: true,
    stock: 90,
    featured: false
  },
  {
    name: "Fresh Tomatoes",
    description: "Farm fresh red tomatoes",
    price: 30,
    originalPrice: 35,
    discount: 14,
    category: "Fruits & Vegetables",
    image: "/images/product-img-3.jpg",
    unit: "500g",
    rating: 4.2,
    reviews: 75,
    inStock: true,
    stock: 100,
    featured: true
  },
  {
    name: "Coke 2L Bottle",
    description: "Refreshing Coca-Cola soft drink",
    price: 90,
    originalPrice: 100,
    discount: 10,
    category: "Snacks & Beverages",
    image: "/images/product-img-4.jpg",
    unit: "2L",
    rating: 4.7,
    reviews: 140,
    inStock: true,
    stock: 60,
    featured: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing products...');
    await Product.destroy({ where: {}, truncate: true });
    
    console.log('🗑️  Clearing existing admins...');
    await Admin.destroy({ where: {}, truncate: true });

    // Insert products
    console.log('📦 Inserting products...');
    const createdProducts = await Product.bulkCreate(products);
    console.log(`✅ ${createdProducts.length} products created successfully`);

    // Create default admin
    console.log('\n👤 Creating default admin account...');
    const admin = await Admin.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@freshvilla.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'super-admin'
    });
    console.log(`✅ Admin created: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Admin: 1`);
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\n🚀 You can now start the server with: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
