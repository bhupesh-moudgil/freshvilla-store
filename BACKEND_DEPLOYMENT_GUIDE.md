# Backend Deployment to Render.com

## 🚀 Quick Deploy (5 Minutes)

Your backend is ready to deploy! Follow these steps:

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `bhupesh-moudgil/freshvilla-store`
3. Configure:
   - **Name**: `freshvilla-backend`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `freshvilla-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

```
NODE_ENV=production
PORT=5000
DEPLOY_ENV=prod-github

# Database (Supabase)
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.inqbadybjwdracaplzwr
DB_PASSWORD=hm9krp5JxrgV7gXt

# JWT (Generate new secrets!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=7d

# Admin
ADMIN_EMAIL=admin@freshvilla.com
ADMIN_PASSWORD=Admin@123

# Frontend
FRONTEND_URL=https://freshvilla.in

# SMTP
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=2525
SMTP_USER=info@freshvilla.in
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=info@freshvilla.in
```

⚠️ **IMPORTANT**: Generate new JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Render will give you a URL like: `https://freshvilla-backend.onrender.com`

### Step 5: Test Backend
```bash
# Test health
curl https://freshvilla-backend.onrender.com/api/health

# Expected response:
{"success":true,"message":"FreshVilla Backend Server Running"}
```

### Step 6: Seed Database
```bash
curl -X POST https://freshvilla-backend.onrender.com/api/seed

# This creates:
# - Admin user (admin@freshvilla.com / Admin@123)
# - 10 sample products
```

### Step 7: Update Frontend

Edit `freshvilla-customer-web/.env.production`:
```env
REACT_APP_API_URL=https://freshvilla-backend.onrender.com/api
```

Then rebuild and deploy:
```bash
cd freshvilla-customer-web
npm run deploy
```

Wait 2-3 minutes, then test at: https://freshvilla.in/admin/login

---

## Alternative: Use Free Backend Hosting

### Option 1: Railway.app
1. Sign up at https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select `freshvilla-backend` folder
4. Add environment variables
5. Get URL: `https://freshvilla-backend.up.railway.app`

### Option 2: Fl0.com
1. Sign up at https://fl0.com
2. Import from GitHub
3. Configure and deploy

### Option 3: Cyclic.sh
1. Sign up at https://cyclic.sh
2. Connect GitHub
3. Deploy

---

## Custom Domain (Optional)

### After deployment, set up custom domain:

1. **In Render.com:**
   - Go to your web service
   - Click "Settings" → "Custom Domain"
   - Add: `backend.freshvilla.in`

2. **In your DNS provider:**
   - Add CNAME record:
     ```
     backend.freshvilla.in → freshvilla-backend.onrender.com
     ```

3. **Update frontend `.env.production`:**
   ```env
   REACT_APP_API_URL=https://backend.freshvilla.in/api
   ```

---

## Troubleshooting

### "Application failed to respond"
- Check environment variables are set correctly
- Check build logs in Render dashboard
- Ensure database credentials are correct

### "Database connection failed"
- Verify Supabase credentials
- Check if Supabase IP whitelist allows Render IPs
- Try connection pooler URL instead of direct

### "CORS error"
- Add your frontend URL to `FRONTEND_URL` env var
- Check `server.js` has correct allowed origins

---

## Current Status

✅ Backend code: Ready
✅ Security: Production-grade  
✅ Database: Supabase configured
✅ Local testing: Passing
⏳ **Deployment: Pending** (follow steps above)

**After deployment**, your admin login at https://freshvilla.in/admin/login will work!

---

## Quick Reference

**Local Backend**: `http://localhost:5001/api`
**Production Backend**: `https://freshvilla-backend.onrender.com/api` (after deployment)

**Admin Credentials:**
- Email: `admin@freshvilla.com`
- Password: `Admin@123`

**Important URLs:**
- Render Dashboard: https://dashboard.render.com
- Backend Repo: https://github.com/bhupesh-moudgil/freshvilla-store
- Frontend: https://freshvilla.in
