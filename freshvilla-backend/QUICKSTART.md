# 🚀 Quick Start Guide - FreshVilla Backend

## ⚡ 5-Minute Setup

### 1. Install MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Check if MongoDB is running:**
```bash
brew services list | grep mongodb
# Should show: mongodb-community started
```

### 2. Setup Backend

```bash
# Navigate to backend folder
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend

# Dependencies are already installed!
# If you need to reinstall:
# npm install

# Seed database with products and admin user
npm run seed
```

Expected output:
```
✅ 10 products created successfully
✅ Admin created: admin@freshvilla.com
   Password: Admin@123
```

### 3. Start Server

```bash
npm run dev
```

Expected output:
```
🚀 FreshVilla Backend Server
📍 Running on port 5000
✅ MongoDB Connected
```

### 4. Test It!

Open a new terminal and test:

```bash
# Test health check
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products

# Admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freshvilla.com","password":"Admin@123"}'
```

## ✅ Success Checklist

- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Database seeded (10 products + 1 admin)
- [ ] Server running on port 5000
- [ ] Health check returns success
- [ ] Products API returns data
- [ ] Admin login works

## 🎯 Admin Login Credentials

```
Email: admin@freshvilla.com
Password: Admin@123
```

**⚠️ Change these in production!**

## 📡 API is Ready!

Your backend is now running with:
- ✅ 10 Products
- ✅ Product CRUD APIs
- ✅ Coupon Management APIs
- ✅ Order Management APIs
- ✅ Admin Authentication

Base URL: `http://localhost:5000/api`

## 🔗 Next Steps

1. **Test with Postman/Insomnia**
   - Import API endpoints from README.md
   - Test product creation, updates, deletes

2. **Connect Frontend**
   - Update frontend to call APIs instead of using JSON
   - Add authentication for admin routes

3. **Build Admin Dashboard**
   - Create React admin panel
   - Add forms for product/coupon management

## 🐛 Troubleshooting

### MongoDB not starting?
```bash
# macOS
brew services restart mongodb-community

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Port 5000 already in use?
Edit `.env` file:
```env
PORT=5001
```

### Can't connect to database?
Check `.env` has:
```env
MONGODB_URI=mongodb://localhost:27017/freshvilla
```

## 📞 Help

If you're stuck:
1. Check `README.md` for full documentation
2. Ensure MongoDB is running: `brew services list`
3. Check server logs in the terminal
4. Verify `.env` configuration

---

**You're all set! Backend is running 🎉**
