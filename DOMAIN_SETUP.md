# 🌐 FreshVilla.in - Custom Domain Setup

## 📋 Overview

**Domain:** freshvilla.in  
**Frontend:** GitHub Pages  
**Backend:** Render.com/Railway (free tier)  
**Database:** Supabase PostgreSQL

---

## 🚀 Step 1: Deploy Frontend to GitHub Pages

### 1.1 Update Configuration

✅ Already done:
- `package.json` homepage updated to `https://freshvilla.in`

### 1.2 Create CNAME file

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web/public
echo "freshvilla.in" > CNAME
```

### 1.3 Build and Deploy

```bash
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 🔧 Step 2: Configure DNS (At Your Domain Registrar)

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add these DNS records:

### For Apex Domain (freshvilla.in):

**A Records** (Add all 4):
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A  
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

### For WWW Subdomain:

**CNAME Record**:
```
Type: CNAME
Name: www
Value: bhupesh-moudgil.github.io
```

**Note:** Replace `bhupesh-moudgil` with your actual GitHub username if different.

---

## 📱 Step 3: Enable HTTPS on GitHub

1. Go to your GitHub repo: `https://github.com/bhupesh-moudgil/freshvilla-store`
2. Go to **Settings** → **Pages**
3. Under "Custom domain", enter: `freshvilla.in`
4. Click **Save**
5. Wait 5-10 minutes
6. Check **"Enforce HTTPS"** (appears after DNS propagates)

---

## 🔗 Step 4: Deploy Backend

Your backend needs to be accessible online. Options:

### Option A: Render.com (Recommended - Free)

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your backend repo
5. Configure:
   - **Name:** freshvilla-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     DEPLOY_ENV=prod-github
     DB_HOST=aws-1-ap-south-1.pooler.supabase.com
     DB_PORT=6543
     DB_NAME=postgres
     DB_USER=postgres.inqbadybjwdracaplzwr
     DB_PASSWORD=hm9krp5JxrgV7gXt
     JWT_SECRET=freshvilla-secret-key-2024
     JWT_EXPIRE=7d
     ADMIN_EMAIL=admin@freshvilla.com
     ADMIN_PASSWORD=Admin@123
     FRONTEND_URL=https://freshvilla.in
     ```
6. Click **"Create Web Service"**
7. Your backend URL will be: `https://freshvilla-backend.onrender.com`

### Update Frontend API URL

Create `/Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web/.env.production`:

```env
REACT_APP_API_URL=https://freshvilla-backend.onrender.com/api
```

Then rebuild and redeploy:
```bash
npm run build
npm run deploy
```

---

## ✅ Verification Steps

### 1. Check DNS Propagation
```bash
# Check A records
dig freshvilla.in

# Check CNAME
dig www.freshvilla.in
```

Or visit: https://dnschecker.org

### 2. Test Website
- Visit: https://freshvilla.in
- Should load your store
- Check: Products display correctly
- Test: Cart and checkout

### 3. Test Backend
```bash
curl https://freshvilla-backend.onrender.com/api/health
```

Should return: `{"success":true,"message":"FreshVilla Backend Server Running"}`

---

## 🎯 Complete Deployment Checklist

- [ ] CNAME file created in `public/` folder
- [ ] Built frontend: `npm run build`
- [ ] Deployed to GitHub Pages: `npm run deploy`
- [ ] DNS A records added (4 records for apex domain)
- [ ] DNS CNAME record added (for www subdomain)
- [ ] Custom domain configured in GitHub Pages settings
- [ ] HTTPS enforced in GitHub Pages
- [ ] Backend deployed to Render.com
- [ ] `.env.production` created with backend URL
- [ ] Frontend rebuilt with production env
- [ ] Redeployed frontend
- [ ] Tested: https://freshvilla.in loads
- [ ] Tested: Products display
- [ ] Tested: API connection works
- [ ] Admin login tested

---

## 🆘 Troubleshooting

**Site not loading?**
- Wait 24-48 hours for DNS propagation
- Check DNS with: `nslookup freshvilla.in`
- Verify GitHub Pages is enabled

**HTTPS not working?**
- Wait 10-15 minutes after adding custom domain
- Ensure DNS is properly configured
- Try disabling and re-enabling HTTPS in GitHub settings

**Products not loading?**
- Check backend URL in `.env.production`
- Verify backend is running: `curl <backend-url>/api/health`
- Check browser console for CORS errors

---

## 📞 Support

**Current Setup:**
- ✅ Database: Supabase (seeded with 10 products)
- ✅ Admin: admin@freshvilla.com / Admin@123
- ⚠️ Admin Dashboard: 70% complete (login works, management pages need completion)

**For Admin Dashboard Completion:**
Start a new conversation with fresh context to build remaining admin components.

---

## 🚀 Quick Deploy Commands

```bash
# Step 1: Create CNAME
cd /Users/maropost/Documents/freshvilla/Project-files/freshvilla-customer-web/public
echo "freshvilla.in" > CNAME

# Step 2: Build and Deploy
cd ..
npm run build
npm run deploy

# Done! Now configure DNS at your registrar.
```
