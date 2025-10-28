# Render.com Deployment Troubleshooting

## Current Issue: 502 Bad Gateway on POST Requests

### Symptoms:
- ✅ GET `/api/health` works
- ❌ POST `/api/auth/login` returns 502
- ❌ POST `/api/seed` returns 502

This indicates the server is responding but failing on database operations.

---

## Step 1: Check Render Logs

1. Go to https://dashboard.render.com
2. Click on your `freshvilla-backend` service
3. Click **"Logs"** tab
4. Look for errors related to:
   - Database connection
   - Memory issues
   - Timeout errors

---

## Step 2: Verify Environment Variables

In Render Dashboard → Service → Environment:

**Required Variables:**
```
NODE_ENV=production
PORT=5000  
DEPLOY_ENV=prod-github

DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.inqbadybjwdracaplzwr
DB_PASSWORD=hm9krp5JxrgV7gXt

JWT_SECRET=(generate new with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRE=7d

ADMIN_EMAIL=admin@freshvilla.in
ADMIN_PASSWORD=Admin@123

FRONTEND_URL=https://freshvilla.in
```

---

## Step 3: Check Database Connection

### Option A: Verify Supabase Credentials

1. Go to Supabase dashboard
2. Check if connection pooler is enabled
3. Verify the credentials match

### Option B: Test Connection Locally

```bash
cd freshvilla-backend

# Use Render's environment variables
export DB_HOST=aws-1-ap-south-1.pooler.supabase.com
export DB_PORT=6543
export DB_NAME=postgres
export DB_USER=postgres.inqbadybjwdracaplzwr
export DB_PASSWORD=hm9krp5JxrgV7gXt
export DEPLOY_ENV=prod-github

# Test connection
npm run seed

# Should output:
# ✅ Supabase PostgreSQL Connected Successfully
# ✅ Admin created: admin@freshvilla.in
```

---

## Step 4: Common Fixes

### Fix 1: Supabase Pooler Configuration

The error might be that Render's IPs are being blocked. Try switching to direct connection:

**Change in Render Environment Variables:**
```
DB_HOST=db.inqbadybjwdracaplzwr.supabase.co
DB_PORT=5432
```

Then click **"Manual Deploy"** → **"Clear build cache & deploy"**

### Fix 2: Increase Memory/Timeout

Render Free tier has limits:
- 512MB RAM
- 30s request timeout

If seed is timing out:
1. In Render Dashboard → Settings
2. Check "Health Check Path": `/api/health`
3. Increase timeout if possible

### Fix 3: Database SSL Configuration

Render might need different SSL settings. Update `database.js`:

```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  statement_timeout: 60000, // 60 seconds
  query_timeout: 60000
}
```

---

## Step 5: Manual Database Seeding

If automatic seeding fails, seed manually:

### Method 1: SSH into Render

```bash
# In Render Dashboard → Shell
npm run seed
```

### Method 2: Use Supabase SQL Editor

Go to Supabase → SQL Editor and run:

```sql
-- Create admin user
INSERT INTO admins (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@freshvilla.in',
  '$2a$10$YourBcryptHashedPasswordHere', -- Need to generate this
  'super-admin',
  NOW(),
  NOW()
);

-- Insert sample products
INSERT INTO products (id, name, description, price, "originalPrice", category, image, unit, rating, reviews, "inStock", stock, featured, "isActive", "createdAt", "updatedAt")
VALUES 
(gen_random_uuid(), 'Fresh Milk', 'Pure cow milk', 60, 65, 'Dairy & Eggs', '/images/product-img-5.jpg', '1L', 4.8, 150, true, 100, true, true, NOW(), NOW()),
(gen_random_uuid(), 'Brown Bread', 'Whole wheat bread', 45, 50, 'Bakery', '/images/product-img-7.jpg', '400g', 4.6, 120, true, 50, true, true, NOW(), NOW()),
(gen_random_uuid(), 'Basmati Rice', 'Premium quality rice', 180, 200, 'Groceries', '/images/product-img-6.jpg', '1kg', 4.9, 180, true, 80, true, true, NOW(), NOW());
```

**To generate password hash:**
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@123', 10, (e,h) => console.log(h))"
```

---

## Step 6: Alternative - Use Different Database

If Supabase continues to have connection issues from Render:

### Option A: Use Render PostgreSQL
1. In Render Dashboard → New → PostgreSQL
2. Create free database
3. Copy connection string
4. Update environment variables

### Option B: Use Neon.tech (Free PostgreSQL)
1. Sign up at https://neon.tech
2. Create database
3. Get connection pooler URL
4. Update environment variables

---

## Step 7: Test Admin Login

Once database is seeded, test:

```bash
# Test login
curl -X POST https://freshvilla-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freshvilla.in","password":"Admin@123"}'

# Expected response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {...},
    "token": "eyJ..."
  }
}
```

---

## Step 8: Update Frontend

Once backend works, test on production:

1. Go to https://freshvilla.in/admin/login
2. Enter:
   - Email: `admin@freshvilla.in`
   - Password: `Admin@123`
3. Should redirect to dashboard

---

## Quick Diagnosis Commands

Run these to diagnose:

```bash
# Test health (should work)
curl https://freshvilla-backend.onrender.com/api/health

# Test products (should work if DB connected)
curl https://freshvilla-backend.onrender.com/api/products

# Test login (currently failing)
curl -X POST https://freshvilla-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freshvilla.in","password":"Admin@123"}'
```

---

## Current Status

**Backend URL**: https://freshvilla-backend.onrender.com
**Frontend URL**: https://freshvilla.in

**Issue**: Database operations (POST requests) returning 502
**Most Likely Cause**: 
1. Supabase connection pooler timeout from Render
2. Database SSL/auth configuration mismatch
3. Render free tier memory limits

**Recommended Fix**: 
Check Render logs first, then try switching to direct Supabase connection (not pooler).

---

## Need Help?

If still stuck:
1. Check Render logs and paste error messages
2. Verify Supabase is accessible from external IPs
3. Consider using Render's own PostgreSQL database
4. Contact me with specific error messages from logs
