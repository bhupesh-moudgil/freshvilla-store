# 🚀 FreshVilla Quick Setup Guide

## Current Status

✅ **Backend:** Ready with YugabyteDB/PostgreSQL support (Sequelize)  
✅ **Database:** Configured for Supabase (testing) & YugabyteDB (production)  
✅ **Frontend:** React app with cart, checkout, and admin login  
⏳ **TODO:** Setup Supabase & Build Admin Dashboard UI

---

## 🎯 Quick Start (3 Steps)

### Step 1: Setup Supabase Database (5 minutes)

1. **Go to:** https://supabase.com
2. **Sign up** with GitHub
3. **Create new project:**
   - Name: `freshvilla-testing`
   - Password: Choose strong password (save it!)
   - Region: Choose closest
4. **Get connection details:**
   - Go to Settings > Database
   - Copy connection string details

5. **Update `.env` file:**

```bash
# Edit: freshvilla-backend/.env
DB_HOST=db.xxxxxxxxxxxxx.supabase.co  # Replace xxx with your host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-actual-password  # Replace with your password
```

### Step 2: Start Backend Server

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend

# Start server
npm run dev
```

You should see:
```
✅ YugabyteDB Connected Successfully
📊 Database synced
🚀 FreshVilla Backend Server running on port 5000
```

### Step 3: Create Admin User

```bash
# In backend directory
npm run seed
```

Default admin created:
- **Email:** admin@freshvilla.com
- **Password:** Admin@123

---

## 🌐 Test Admin Login

### Start Frontend:
```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web
npm start
```

### Login:
1. Go to: http://localhost:3000/admin/login
2. Enter:
   - Email: `admin@freshvilla.com`
   - Password: `Admin@123`
3. Should redirect to dashboard!

---

## 📂 Project Structure

```
freshvilla/
├── freshvilla-backend/          ← Express + Sequelize + PostgreSQL
│   ├── src/
│   │   ├── models/              ← Admin, Product, Order, Coupon
│   │   ├── routes/              ← API endpoints
│   │   ├── controllers/         ← Business logic
│   │   └── config/
│   │       └── database.js      ← Sequelize config
│   ├── .env                     ← Database credentials (Supabase)
│   ├── .env.development         ← For testing (Supabase)
│   └── .env.production          ← For production (YugabyteDB)
│
└── freshvilla-customer-web/     ← React frontend
    ├── src/
    │   ├── pages/
    │   │   └── Admin/           ← Admin pages
    │   ├── services/
    │   │   └── api.js           ← Backend API calls
    │   └── contexts/
    │       └── AuthContext.js   ← Admin authentication
    └── package.json
```

---

## 🔄 Environment Switching

### For GitHub Testing (Current):
```env
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
NODE_ENV=development
```

### For Production (Google VM + YugabyteDB):
```env
DB_HOST=localhost
DB_PORT=5433
NODE_ENV=production
```

**Both use the same code!** Just swap `.env` files.

---

## 🎨 Next: Build Admin Dashboard

Once backend is running, we'll build:

1. ✅ **Dashboard Home** - Stats & overview
2. ✅ **Products Manager** - CRUD operations
3. ✅ **Orders Manager** - View & update status
4. ✅ **Coupons Manager** - Discount codes
5. ✅ **Settings** - Logo & store config

---

## 🆘 Troubleshooting

**Backend won't start?**
```bash
# Check if port 5000 is free
lsof -ti:5000 | xargs kill -9

# Reinstall dependencies
npm install
```

**Database connection error?**
- Verify Supabase credentials in `.env`
- Check project is active on Supabase dashboard
- Test connection: `psql -h [host] -U postgres -d postgres`

**Admin login fails?**
- Run seed script: `npm run seed`
- Check backend logs
- Verify API URL in frontend

---

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **Sequelize Docs:** https://sequelize.org/docs
- **Backend:** Express + Sequelize + PostgreSQL
- **Frontend:** React + Bootstrap + Axios

---

## ✅ Checklist

- [ ] Create Supabase account
- [ ] Get database credentials
- [ ] Update `.env` file
- [ ] Start backend (`npm run dev`)
- [ ] Run seed script (`npm run seed`)
- [ ] Test admin login
- [ ] Build admin dashboard UI
- [ ] Deploy to GitHub Pages
- [ ] Setup Google VM with YugabyteDB (production)
