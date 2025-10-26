# FreshVilla Backend API

Complete backend API for FreshVilla e-commerce platform with MongoDB database.

## 🚀 Features

- ✅ Complete REST API
- ✅ MongoDB database with Mongoose
- ✅ JWT authentication for admin
- ✅ Product management (CRUD)
- ✅ Coupon system with validation
- ✅ Order management
- ✅ Category filtering & search
- ✅ Password hashing with bcrypt
- ✅ CORS enabled for frontend
- ✅ Error handling middleware

## 📋 Prerequisites

Before running this backend, make sure you have:

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or MongoDB Atlas)
3. **npm** or **yarn**

## 🛠️ Installation

### Step 1: Install MongoDB (if not installed)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Linux:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### Step 2: Install Dependencies

```bash
cd freshvilla-backend
npm install
```

### Step 3: Configure Environment

The `.env` file is already created with default values. Review and modify if needed:

```bash
# View current configuration
cat .env
```

Default admin credentials:
- Email: `admin@freshvilla.com`
- Password: `Admin@123`

### Step 4: Seed the Database

Populate the database with initial products and admin user:

```bash
npm run seed
```

This will create:
- 10 sample products
- 1 admin user

## 🎯 Running the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Server will run on: `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new admin | Public |
| POST | `/api/auth/login` | Admin login | Public |
| GET | `/api/auth/me` | Get current admin | Private |

### Products

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create product | Private (Admin) |
| PUT | `/api/products/:id` | Update product | Private (Admin) |
| DELETE | `/api/products/:id` | Delete product | Private (Admin) |
| PATCH | `/api/products/:id/stock` | Update stock | Private (Admin) |

**Query Parameters for GET /api/products:**
- `category` - Filter by category
- `featured` - Filter featured products (true/false)
- `search` - Search by name/description
- `inStock` - Filter in-stock items (true/false)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sort` - Sort options: price_asc, price_desc, name, newest
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

### Coupons

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/coupons` | Get all coupons | Private (Admin) |
| POST | `/api/coupons` | Create coupon | Private (Admin) |
| POST | `/api/coupons/validate` | Validate coupon | Public |
| PUT | `/api/coupons/:id` | Update coupon | Private (Admin) |
| DELETE | `/api/coupons/:id` | Delete coupon | Private (Admin) |
| PATCH | `/api/coupons/:id/toggle` | Toggle active status | Private (Admin) |

### Orders

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | Get all orders | Private (Admin) |
| GET | `/api/orders/:id` | Get single order | Private (Admin) |
| POST | `/api/orders` | Create order | Public |
| PATCH | `/api/orders/:id/status` | Update order status | Private (Admin) |
| GET | `/api/orders/stats/overview` | Get order statistics | Private (Admin) |

## 🔐 Authentication

### Admin Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@freshvilla.com",
  "password": "Admin@123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@freshvilla.com",
      "role": "super-admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Using Token

Include the token in the Authorization header for protected routes:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 Example API Calls

### Create a Product (Admin)

```bash
POST /api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Fresh Mangoes",
  "description": "Sweet and juicy mangoes",
  "price": 120,
  "originalPrice": 150,
  "discount": 20,
  "category": "Fruits & Vegetables",
  "image": "/images/mango.jpg",
  "unit": "1kg",
  "stock": 50,
  "inStock": true,
  "featured": true
}
```

### Create a Coupon (Admin)

```bash
POST /api/coupons
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "code": "SAVE20",
  "description": "Get 20% off on orders above ₹500",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderValue": 500,
  "maxDiscount": 100,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "usageLimit": 100,
  "isActive": true
}
```

### Validate a Coupon (Public)

```bash
POST /api/coupons/validate
Content-Type: application/json

{
  "code": "SAVE20",
  "orderTotal": 600
}
```

## 🗄️ Database Schema

### Product
- name, description
- price, originalPrice, discount
- category, image, unit
- rating, reviews
- inStock, stock, featured

### Coupon
- code, description
- discountType (percentage/fixed)
- discountValue, minOrderValue, maxDiscount
- validFrom, validUntil
- usageLimit, usedCount

### Order
- orderNumber
- customer (name, email, mobile, address)
- items (array of products)
- subtotal, discount, deliveryFee, total
- paymentMethod, paymentStatus
- orderStatus

### Admin
- name, email, password
- role (admin/super-admin)
- isActive, lastLogin

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/freshvilla
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@freshvilla.com
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=http://localhost:3000
```

## 📦 Project Structure

```
freshvilla-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── Product.js            # Product schema
│   │   ├── Coupon.js             # Coupon schema
│   │   ├── Order.js              # Order schema
│   │   └── Admin.js              # Admin schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── products.js           # Product routes
│   │   ├── coupons.js            # Coupon routes
│   │   └── orders.js             # Order routes
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   └── utils/
│       └── seed.js               # Database seeding script
├── server.js                     # Main server file
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── package.json
└── README.md
```

## 🧪 Testing the API

Use Postman, Insomnia, or curl to test the API:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freshvilla.com","password":"Admin@123"}'
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. Make sure MongoDB is running:
```bash
# macOS
brew services list | grep mongodb

# Ubuntu/Linux
sudo systemctl status mongod
```

2. Check connection string in `.env`

### Port Already in Use

If port 5000 is in use, change it in `.env`:
```env
PORT=5001
```

## 📚 Next Steps

1. ✅ Backend is ready!
2. Connect frontend to backend (replace JSON with API calls)
3. Build admin dashboard UI in React
4. Deploy to production (GCP VM)

## 🔐 Security Notes

⚠️ **Before Production:**
- Change default admin password
- Use strong JWT secret
- Enable rate limiting
- Add input sanitization
- Set up HTTPS
- Configure firewall rules

## 📞 Support

For questions or issues:
- Check the API documentation above
- Review error messages in console
- Ensure MongoDB is running
- Verify .env configuration

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
