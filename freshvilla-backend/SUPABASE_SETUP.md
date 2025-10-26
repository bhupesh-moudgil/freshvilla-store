# 🚀 Supabase Setup for GitHub Testing

## Why Supabase?
- ✅ **Free PostgreSQL database** (500MB storage, 2GB bandwidth)
- ✅ **Fully PostgreSQL-compatible** (works with our Sequelize code)
- ✅ **No credit card required**
- ✅ **Same code works for production YugabyteDB**

---

## 📝 Step-by-Step Setup

### 1. Create Supabase Account

1. Go to: **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (or email)

### 2. Create a New Project

1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name:** `freshvilla-testing`
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you
   - **Plan:** Free (default)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### 3. Get Database Connection Details

Once project is ready:

1. Go to **Settings** (⚙️ icon in sidebar)
2. Click **Database**
3. Scroll to **"Connection string"** section
4. You'll see connection details:

```
Host: db.xxxxxxxxxxxxx.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [your-password]
```

### 4. Update Backend `.env` File

Open `/Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend/.env`

**For Testing/GitHub (Supabase):**
```env
NODE_ENV=development

# Supabase PostgreSQL
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
```

**For Production (YugabyteDB on Google VM):**
```env
NODE_ENV=production

# YugabyteDB
DB_HOST=your-vm-ip-address
DB_PORT=5433
DB_NAME=freshvilla
DB_USER=yugabyte
DB_PASSWORD=your-secure-password
```

### 5. Test Connection

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-backend

# Install dependencies (if not done)
npm install

# Start backend
npm run dev
```

You should see:
```
✅ YugabyteDB Connected Successfully
📊 Database synced
🚀 FreshVilla Backend Server
📍 Running on port 5000
```

### 6. Create Admin User

```bash
npm run seed
```

This creates default admin:
- **Email:** admin@freshvilla.com
- **Password:** Admin@123

---

## 🌐 Frontend Configuration

Update frontend `.env` for GitHub Pages:

**Create:** `/Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web/.env.production`

```env
# For GitHub Pages deployment
REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
```

Or if backend is on your Google VM:
```env
REACT_APP_API_URL=http://your-vm-ip:5000/api
```

---

## 🔄 Switching Between Environments

### For GitHub Testing:
```bash
# Backend .env
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
NODE_ENV=development
```

### For Production:
```bash
# Backend .env
DB_HOST=localhost  # or VM IP
DB_PORT=5433
NODE_ENV=production
```

**Both work with the same code!** No changes needed in your models or routes.

---

## 📊 View Database (Optional)

Supabase provides a built-in database viewer:

1. Go to Supabase Dashboard
2. Click **"Table Editor"** in sidebar
3. You'll see your tables: `admins`, `products`, `orders`, `coupons`

---

## 🎯 Next Steps

1. ✅ Create Supabase account
2. ✅ Get connection details
3. ✅ Update `.env` file
4. ✅ Start backend server
5. ✅ Run seed script
6. ✅ Test admin login
7. 🚀 Deploy frontend to GitHub Pages

---

## 💡 Production Deployment (Later)

When deploying to Google VM with YugabyteDB:

1. Install YugabyteDB on VM
2. Update `.env` with VM details
3. Same backend code works!
4. No migrations needed

---

## 🆘 Troubleshooting

**Connection refused?**
- Check Supabase project is active (Settings > General)
- Verify password is correct
- Check if IP is whitelisted (Supabase allows all by default)

**Tables not created?**
- Backend auto-creates tables on first run
- Check logs: `npm run dev`

**Need help?**
- Supabase Docs: https://supabase.com/docs
- Our setup is standard PostgreSQL + Sequelize
